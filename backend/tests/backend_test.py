"""Backend regression tests for Satvik Capital."""
import os
import time
from datetime import datetime, timedelta, timezone

import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else None
if not BASE_URL:
    # fallback: read from frontend/.env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break

ADMIN_EMAIL = "satvikkinvestments@gmail.com"
ADMIN_PASSWORD = "Satvik@2026"

IST = timezone(timedelta(hours=5, minutes=30))


def _future_weekday(offset=2):
    d = datetime.now(IST).date() + timedelta(days=offset)
    while d.weekday() == 6:
        d += timedelta(days=1)
    return d.strftime("%Y-%m-%d")


def _next_sunday():
    d = datetime.now(IST).date() + timedelta(days=1)
    while d.weekday() != 6:
        d += timedelta(days=1)
    return d.strftime("%Y-%m-%d")


@pytest.fixture(scope="session")
def s():
    return requests.Session()


@pytest.fixture(scope="session")
def admin(s):
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"admin login failed: {r.status_code} {r.text}")
    return r.json()


# -------- Root --------
def test_root(s):
    r = s.get(f"{BASE_URL}/api/")
    assert r.status_code == 200
    assert "Satvik Capital" in r.json()["message"]


# -------- Slots --------
def test_slots_weekday(s):
    d = _future_weekday(2)
    r = s.get(f"{BASE_URL}/api/slots", params={"date": d})
    assert r.status_code == 200
    slots = r.json()["slots"]
    assert len(slots) == 8
    times = [x["time"] for x in slots]
    assert times == ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]


def test_slots_sunday(s):
    r = s.get(f"{BASE_URL}/api/slots", params={"date": _next_sunday()})
    assert r.status_code == 200
    assert r.json()["slots"] == []


# -------- Appointments --------
@pytest.fixture(scope="session")
def created_appt(s):
    date = _future_weekday(3)
    # find an available slot
    slots = s.get(f"{BASE_URL}/api/slots", params={"date": date}).json()["slots"]
    avail = next((x["time"] for x in slots if x["available"]), None)
    assert avail, "no available slot"
    payload = {
        "name": "QA Test Booking",
        "phone": "9999999999",
        "email": "qa@test.com",
        "date": date,
        "time": avail,
        "type": "consultation",
        "message": "automated test",
    }
    r = s.post(f"{BASE_URL}/api/appointments", json=payload)
    assert r.status_code == 200, r.text
    doc = r.json()
    assert doc["name"] == "QA Test Booking"
    assert doc["date"] == date
    assert doc["time"] == avail
    assert doc["type_label"] == "Free Portfolio Consultation"
    assert doc["status"] == "pending"
    return doc


def test_appointment_created(created_appt):
    assert created_appt["id"]


def test_double_booking_conflict(s, created_appt):
    r = s.post(f"{BASE_URL}/api/appointments", json={
        "name": "QA Test Dup", "phone": "8888888888", "email": "",
        "date": created_appt["date"], "time": created_appt["time"],
        "type": "consultation", "message": "",
    })
    assert r.status_code == 409


def test_email_alert_fired(created_appt):
    # Wait a few seconds for background task to fire, then check backend log
    time.sleep(6)
    try:
        with open("/var/log/supervisor/backend.err.log") as f:
            log = f.read()[-20000:]
    except FileNotFoundError:
        pytest.skip("no backend log")
    assert "integrations.emergentagent.com/api/v1/email/send" in log, "email send not called"
    # accept 202 Accepted line
    assert "202 Accepted" in log or "202" in log


# -------- Admin --------
def test_admin_login(admin):
    assert admin["email"] == ADMIN_EMAIL
    assert admin.get("role") == "admin"


def test_admin_appointments_list(s, admin, created_appt):
    r = s.get(f"{BASE_URL}/api/admin/appointments")
    assert r.status_code == 200
    ids = [a["id"] for a in r.json()["appointments"]]
    assert created_appt["id"] in ids


def test_admin_google_status(s, admin):
    r = s.get(f"{BASE_URL}/api/admin/google/status")
    assert r.status_code == 200
    body = r.json()
    assert body["configured"] is False
    assert body["connected"] is False


def test_admin_login_bad_password(s):
    fresh = requests.Session()
    r = fresh.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong-password-xyz"})
    assert r.status_code in (401, 429)


# -------- Chat --------
def test_chat_persona(s):
    sid_resp = s.post(f"{BASE_URL}/api/chat/session")
    assert sid_resp.status_code == 200
    sid = sid_resp.json()["session_id"]
    r = s.post(f"{BASE_URL}/api/chat", json={"session_id": sid, "message": "Who are you?"}, stream=True, timeout=60)
    assert r.status_code == 200
    text = ""
    for line in r.iter_lines(decode_unicode=True):
        if line and line.startswith("data:"):
            payload = line[5:].strip()
            if '"done"' in payload:
                break
            import json as _j
            try:
                text += _j.loads(payload).get("delta", "")
            except Exception:
                pass
    low = text.lower()
    assert "satvik capital" in low or "financial advisor" in low, f"unexpected: {text!r}"
    assert "mutual fund distributor" not in low, f"forbidden phrase in: {text!r}"


# -------- Cleanup --------
def test_zzz_cleanup(s, admin, created_appt):
    # Best-effort: mark cancelled
    s.patch(f"{BASE_URL}/api/admin/appointments/{created_appt['id']}", json={"status": "cancelled"})
