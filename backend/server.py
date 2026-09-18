from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Query, BackgroundTasks
from fastapi.responses import StreamingResponse, RedirectResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import os
import uuid
import json
import logging
import bcrypt
import jwt
import requests as http_requests
import httpx
import re
import ipaddress
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

IST = timezone(timedelta(hours=5, minutes=30))
JWT_ALGORITHM = "HS256"
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "")
GOOGLE_REDIRECT_URI = f"{FRONTEND_URL}/api/oauth/calendar/callback"
GOOGLE_SCOPES = ["https://www.googleapis.com/auth/calendar"]

EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ["EMERGENT_EMAIL_KEY"]
EMAIL_FROM_NAME = os.environ["EMAIL_FROM_NAME"]
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")
NOTIFY_EMAIL = os.environ["NOTIFY_EMAIL"]

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)

def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)

def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)

class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []
    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []
    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)
    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []

def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan(); scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} ≠ real link host {real!r} (G3)")

async def send_email(*, to: str, subject: str, html: str) -> str | None:
    _assert_safe_email(subject, html)
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if EMAIL_REPLY_TO:
        payload["contact_email"] = EMAIL_REPLY_TO
    async with httpx.AsyncClient(timeout=30) as hc:
        resp = await hc.post(f"{EMAIL_BASE_URL}/api/v1/email/send", headers={"X-Email-Key": EMAIL_KEY}, json=payload)
    resp.raise_for_status()
    return resp.json().get("id")

def _row(label: str, value: str) -> str:
    return (f'<tr><td style="padding:8px 12px;color:#6E7E91;font-size:12px;text-transform:uppercase;letter-spacing:.12em">{label}</td>'
            f'<td style="padding:8px 12px;color:#0D1726;font-size:15px">{value}</td></tr>')

def booking_alert_html(appt: dict) -> str:
    rows = "".join([
        _row("Client", escape(appt["name"])),
        _row("Phone", f'<a href="tel:{escape(appt["phone"])}" style="color:#C76A3D">{escape(appt["phone"])}</a>'),
        _row("Email", escape(appt["email"]) or "—"),
        _row("Slot", f'{escape(appt["date"])} · {escape(appt["time"])} IST'),
        _row("Type", escape(appt["type_label"])),
        _row("Notes", escape(appt["message"]) or "—"),
        _row("Calendar", "Added to Google Calendar" if appt.get("google_event_id") else "Not synced (connect Google Calendar in the admin dashboard)"),
    ])
    return (f'<table role="presentation" width="100%" style="background:#F9F6F0;padding:32px 0"><tr><td align="center">'
            f'<table role="presentation" width="560" style="background:#FFFFFF;border:1px solid #E5DCD0;font-family:Georgia,serif">'
            f'<tr><td style="padding:28px 32px 8px;color:#C76A3D;font-size:11px;letter-spacing:.22em;text-transform:uppercase;font-family:Arial,sans-serif">{escape(EMAIL_FROM_NAME)} · New booking</td></tr>'
            f'<tr><td style="padding:0 32px 20px;color:#0B1528;font-size:26px">A client has reserved an hour.</td></tr>'
            f'<tr><td style="padding:0 20px 24px"><table role="presentation" width="100%" style="font-family:Arial,sans-serif;border-top:1px solid #E5DCD0">{rows}</table></td></tr>'
            f'<tr><td style="padding:16px 32px 28px;color:#6E7E91;font-size:12px;font-family:Arial,sans-serif;border-top:1px solid #E5DCD0">'
            f'Sent automatically by {escape(EMAIL_FROM_NAME)} when a visitor books on your website.</td></tr>'
            f'</table></td></tr></table>')

async def notify_new_booking(appt: dict):
    try:
        await send_email(to=NOTIFY_EMAIL, subject=f"New booking · {appt['name']} · {appt['date']} {appt['time']} IST", html=booking_alert_html(appt))
        await db.appointments.update_one({"id": appt["id"]}, {"$set": {"notified": True}})
    except Exception as e:
        logger.error(f"booking email failed: {e}")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ---------------- Auth ----------------

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=60), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return {"id": str(user["_id"]), "email": user["email"], "name": user.get("name", ""), "role": user.get("role", "admin")}

class LoginRequest(BaseModel):
    email: str
    password: str

@api_router.post("/auth/login")
async def login(body: LoginRequest, request: Request, response: Response):
    email = body.email.lower().strip()
    identifier = f"{request.client.host}:{email}"
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("count", 0) >= 5:
        last = attempt.get("last_attempt")
        if last and last.tzinfo is None:
            last = last.replace(tzinfo=timezone.utc)
        if last and datetime.now(timezone.utc) - last < timedelta(minutes=15):
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"last_attempt": datetime.now(timezone.utc)}},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await db.login_attempts.delete_one({"identifier": identifier})
    access_token = create_access_token(str(user["_id"]), email)
    refresh_token = create_refresh_token(str(user["_id"]))
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="none", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    return {"id": str(user["_id"]), "email": email, "name": user.get("name", ""), "role": user.get("role", "admin")}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user

@api_router.post("/auth/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    access_token = create_access_token(str(user["_id"]), user["email"])
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="none", max_age=3600, path="/")
    return {"message": "refreshed"}

# ---------------- Chatbot ----------------

CHAT_SYSTEM = """You are the digital concierge of Satvik Capital — the personal financial advisory practice of Satvik Kattimani, based in India.

About Satvik: holds a Bachelor's degree in Investment Banking and interned at an asset management company (AMC) where he worked on the ideation and execution of mutual fund products. His edge: he understands how funds are built from the inside, so he selects and monitors them with an insider's eye. He personally handles every client — no call centres.

Persona: warm, polished, discreet — like the front desk of a private wealth atelier. Keep answers concise (2-4 sentences). Refer to Satvik as a "financial advisor". Do NOT use the phrase "mutual fund distributor" unless a visitor explicitly asks about registration, in which case say Satvik is AMFI-registered (ARN-349743).

What you do:
- Answer educational questions about mutual funds: SIPs, lumpsum investing, ELSS & tax saving, debt vs equity funds, portfolio review/restructuring, KYC basics, goal-based investing, direct vs regular plans (regular plans include Satvik's ongoing guidance, rebalancing and behavioural coaching; direct plans have a lower expense ratio but you manage everything alone).
- Explain Satvik Capital's services: SIP planning, portfolio review & restructuring, goal-based investing, tax-efficient investing, ongoing advisory.
- Point visitors to the SIP calculator on this website and encourage them to book a FREE portfolio consultation via the "Book" section.

Strict rules (SEBI/AMFI compliance):
- NEVER recommend or name specific mutual fund schemes, stocks, or give buy/sell calls.
- NEVER promise or project guaranteed returns. If asked about returns, say they depend on market performance and goals, and suggest a consultation.
- Always remind, where relevant, that mutual fund investments are subject to market risks.
- For anything personal or advice-seeking ("which fund should I buy", "is my portfolio good"), politely say it needs a personalised review and invite them to book a free consultation.
- For urgent human help, share: Phone 9740542188, Email satvikkinvestments@gmail.com.
- If asked who you are, say you are the digital concierge of Satvik Capital, the financial advisory practice of Satvik Kattimani."""

class ChatRequest(BaseModel):
    session_id: str
    message: str

@api_router.post("/chat/session")
async def chat_session():
    sid = str(uuid.uuid4())
    await db.chat_sessions.insert_one({"session_id": sid, "created_at": datetime.now(timezone.utc)})
    return {"session_id": sid}

@api_router.post("/chat")
async def chat(body: ChatRequest):
    message = body.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Empty message")
    history = await db.chat_messages.find({"session_id": body.session_id}, {"_id": 0}).sort("created_at", 1).to_list(20)
    await db.chat_messages.insert_one({"session_id": body.session_id, "role": "user", "content": message, "created_at": datetime.now(timezone.utc)})

    convo = ""
    for m in history[-12:]:
        speaker = "Visitor" if m["role"] == "user" else "Concierge"
        convo += f"{speaker}: {m['content']}\n"
    prompt = f"{convo}Visitor: {message}\nConcierge:"

    async def event_generator():
        full = ""
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone
            llm = LlmChat(
                api_key=os.environ["EMERGENT_LLM_KEY"],
                session_id=body.session_id,
                system_message=CHAT_SYSTEM,
            ).with_model("openai", "gpt-5.4-mini")
            async for ev in llm.stream_message(UserMessage(text=prompt)):
                if isinstance(ev, TextDelta):
                    full += ev.content
                    yield f"data: {json.dumps({'delta': ev.content})}\n\n"
                elif isinstance(ev, StreamDone):
                    break
        except Exception as e:
            logger.error(f"chat error: {e}")
            if not full:
                full = "I apologise, I am momentarily unavailable. Please reach Satvik directly at 9740542188 or satvikkinvestments@gmail.com."
                yield f"data: {json.dumps({'delta': full})}\n\n"
        await db.chat_messages.insert_one({"session_id": body.session_id, "role": "assistant", "content": full, "created_at": datetime.now(timezone.utc)})
        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )

# ---------------- Appointments ----------------

SLOT_HOURS = [10, 11, 12, 13, 14, 15, 16, 17]
APPOINTMENT_TYPES = {"consultation": "Free Portfolio Consultation", "restructuring": "Portfolio Restructuring"}

class AppointmentCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = ""
    date: str
    time: str
    type: str = "consultation"
    message: Optional[str] = ""

class AppointmentUpdate(BaseModel):
    status: str

@api_router.get("/slots")
async def get_slots(date: str = Query(...)):
    try:
        day = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, use YYYY-MM-DD")
    now = datetime.now(IST)
    if day < now.date() or day > now.date() + timedelta(days=30):
        raise HTTPException(status_code=400, detail="Date out of booking range")
    if day.weekday() == 6:
        return {"date": date, "slots": []}
    booked = await db.appointments.find(
        {"date": date, "status": {"$in": ["pending", "confirmed"]}}, {"_id": 0, "time": 1}
    ).to_list(100)
    booked_times = {b["time"] for b in booked}
    slots = []
    for h in SLOT_HOURS:
        t = f"{h:02d}:00"
        available = t not in booked_times
        if day == now.date() and h <= now.hour:
            available = False
        slots.append({"time": t, "available": available})
    return {"date": date, "slots": slots}

@api_router.post("/appointments")
async def create_appointment(body: AppointmentCreate, background: BackgroundTasks):
    if not body.name.strip() or not body.phone.strip():
        raise HTTPException(status_code=400, detail="Name and phone are required")
    if body.type not in APPOINTMENT_TYPES:
        raise HTTPException(status_code=400, detail="Invalid appointment type")
    slot_resp = await get_slots(body.date)
    slot = next((s for s in slot_resp["slots"] if s["time"] == body.time), None)
    if not slot or not slot["available"]:
        raise HTTPException(status_code=409, detail="This slot is no longer available")
    appt_id = str(uuid.uuid4())
    doc = {
        "id": appt_id,
        "name": body.name.strip(),
        "phone": body.phone.strip(),
        "email": body.email.strip(),
        "date": body.date,
        "time": body.time,
        "type": body.type,
        "type_label": APPOINTMENT_TYPES[body.type],
        "message": body.message.strip(),
        "status": "pending",
        "google_event_id": None,
        "created_at": datetime.now(timezone.utc),
    }
    await db.appointments.insert_one(doc)
    event_id = await maybe_create_calendar_event(doc)
    if event_id:
        await db.appointments.update_one({"id": appt_id}, {"$set": {"google_event_id": event_id}})
    doc.pop("_id", None)
    doc["created_at"] = doc["created_at"].isoformat()
    doc["google_event_id"] = event_id
    background.add_task(notify_new_booking, doc)
    return doc

# ---------------- Admin ----------------

@api_router.get("/admin/appointments")
async def list_appointments(user: dict = Depends(get_current_user)):
    appts = await db.appointments.find({}, {"_id": 0}).sort([("date", 1), ("time", 1)]).to_list(500)
    for a in appts:
        if isinstance(a.get("created_at"), datetime):
            a["created_at"] = a["created_at"].isoformat()
    return {"appointments": appts}

@api_router.patch("/admin/appointments/{appt_id}")
async def update_appointment(appt_id: str, body: AppointmentUpdate, user: dict = Depends(get_current_user)):
    if body.status not in ("pending", "confirmed", "completed", "cancelled"):
        raise HTTPException(status_code=400, detail="Invalid status")
    result = await db.appointments.update_one({"id": appt_id}, {"$set": {"status": body.status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"id": appt_id, "status": body.status}

# ---------------- Google Calendar ----------------

@api_router.get("/admin/google/status")
async def google_status(user: dict = Depends(get_current_user)):
    doc = await db.google_tokens.find_one({"_id": "admin"}, {"_id": 0, "tokens.refresh_token": 1, "email": 1})
    return {"configured": bool(GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET), "connected": bool(doc), "email": (doc or {}).get("email", "")}

@api_router.get("/admin/google/login")
async def google_login(user: dict = Depends(get_current_user)):
    if not (GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET):
        raise HTTPException(status_code=503, detail="Google Calendar is not configured yet. GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required.")
    from google_auth_oauthlib.flow import Flow
    flow = Flow.from_client_config(
        {"web": {"client_id": GOOGLE_CLIENT_ID, "client_secret": GOOGLE_CLIENT_SECRET,
                 "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                 "token_uri": "https://oauth2.googleapis.com/token"}},
        scopes=GOOGLE_SCOPES, redirect_uri=GOOGLE_REDIRECT_URI)
    url, _ = flow.authorization_url(access_type="offline", prompt="consent")
    return {"authorization_url": url}

@api_router.get("/oauth/calendar/callback")
async def google_callback(code: str):
    if not (GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET):
        raise HTTPException(status_code=503, detail="Google Calendar not configured")
    token_resp = http_requests.post("https://oauth2.googleapis.com/token", data={
        "code": code, "client_id": GOOGLE_CLIENT_ID, "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI, "grant_type": "authorization_code",
    }).json()
    if "access_token" not in token_resp:
        raise HTTPException(status_code=400, detail="Google authorization failed")
    userinfo = http_requests.get("https://www.googleapis.com/oauth2/v2/userinfo",
                                 headers={"Authorization": f"Bearer {token_resp['access_token']}"}).json()
    await db.google_tokens.update_one(
        {"_id": "admin"},
        {"$set": {"tokens": token_resp, "email": userinfo.get("email", ""), "connected_at": datetime.now(timezone.utc)}},
        upsert=True)
    return RedirectResponse(f"{FRONTEND_URL}/admin?google=connected")

async def maybe_create_calendar_event(appt: dict):
    if not (GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET):
        return None
    doc = await db.google_tokens.find_one({"_id": "admin"})
    if not doc:
        return None
    try:
        from google.oauth2.credentials import Credentials
        from googleapiclient.discovery import build
        from google.auth.transport.requests import Request as GoogleRequest
        tokens = doc["tokens"]
        creds = Credentials(token=tokens["access_token"], refresh_token=tokens.get("refresh_token"),
                            token_uri="https://oauth2.googleapis.com/token",
                            client_id=GOOGLE_CLIENT_ID, client_secret=GOOGLE_CLIENT_SECRET)
        if creds.expired and creds.refresh_token:
            creds.refresh(GoogleRequest())
            await db.google_tokens.update_one({"_id": "admin"}, {"$set": {"tokens.access_token": creds.token}})
        service = build("calendar", "v3", credentials=creds)
        hour = int(appt["time"].split(":")[0])
        start = f"{appt['date']}T{appt['time']}:00+05:30"
        end = f"{appt['date']}T{hour + 1:02d}:00:00+05:30"
        event = service.events().insert(calendarId="primary", body={
            "summary": f"{appt['type_label']} — {appt['name']}",
            "description": f"Phone: {appt['phone']}\nEmail: {appt['email']}\nNotes: {appt['message']}",
            "start": {"dateTime": start, "timeZone": "Asia/Kolkata"},
            "end": {"dateTime": end, "timeZone": "Asia/Kolkata"},
        }).execute()
        return event.get("id")
    except Exception as e:
        logger.error(f"google calendar event error: {e}")
        return None

# ---------------- Core ----------------

@api_router.get("/")
async def root():
    return {"message": "Satvik Capital — Financial Advisory API"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[FRONTEND_URL] if FRONTEND_URL else os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.appointments.create_index([("date", 1), ("time", 1)])
    await db.chat_messages.create_index("session_id")
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "email": admin_email, "password_hash": hash_password(admin_password),
            "name": "Satvik Kattimani", "role": "admin", "created_at": datetime.now(timezone.utc),
        })
        logger.info("admin seeded")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("admin password updated")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
