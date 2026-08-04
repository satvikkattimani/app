# PRD — Satvik Kattimani · Wealth & Investments

## Original Problem Statement
SEBI/AMFI-registered individual Mutual Fund Distributor (Satvik Kattimani, ARN-349743) needs a luxurious, state-of-the-art website for visibility to HNI clients, with: AI chatbot, customer service desk (direct phone/email), and appointment booking for free portfolio consultation / restructuring. Google Calendar sync requested for bookings.

## User Personas
- HNI visitor / potential client: explores services, chats with concierge, books a free consultation.
- Existing client: quick contact via phone/email/WhatsApp.
- Satvik (admin): views and manages appointment bookings, connects Google Calendar.

## Architecture
- Frontend: React + Tailwind + shadcn/ui, dark "quiet luxury" theme (obsidian #0A0A0A, gold #D4AF37, Cormorant Garamond + Manrope), framer-motion reveals. Pages: Landing (`/`), Admin Login (`/admin/login`), Admin Dashboard (`/admin`).
- Backend: FastAPI (`/api` prefix). JWT cookie auth (admin seeded from env), SSE-streamed AI chatbot (emergentintegrations, gpt-5.4-mini, EMERGENT_LLM_KEY, SEBI-compliant system prompt), slot generation (Mon–Sat 10:00–17:00 IST, 30-day window, booked-slot exclusion), appointments CRUD, Google Calendar OAuth (dormant until credentials provided).
- DB: MongoDB — users, appointments, chat_sessions, chat_messages, login_attempts, google_tokens.

## Core Requirements (static)
- Display ARN-349743 + AMFI registration prominently (hero, footer, chatbot header).
- Contact: 9740542188, satvikkinvestments@gmail.com.
- Mutual fund risk disclaimer in footer.
- Booking: free consultation / restructuring, slot picker, confirmation.

## Implemented (2026-08-04)
- Luxury landing page: hero, about, services bento grid, testimonials (placeholder content), booking, service desk, compliance footer.
- AI chatbot widget: streaming responses, SEBI/AMFI-compliant guardrails, persistent history in DB.
- Appointment booking: calendar + hourly IST slots, double-booking prevention, confirmation screen.
- Admin dashboard: JWT login (brute-force lockout), stats, appointment table with status management (pending/confirmed/completed/cancelled).
- Google Calendar integration code complete (OAuth + auto event creation) — awaiting user's GOOGLE_CLIENT_ID/SECRET.
- Test credentials: admin satvikkinvestments@gmail.com / Satvik@2026.

## Backlog
- P0: User provides Google Cloud OAuth credentials → enable calendar sync (setup guide shared).
- P1: Email notification to Satvik on new booking (Resend).
- P1: Replace placeholder testimonials/portrait with real content.
- P2: Mutual fund scheme explorer (MOCKED data), blog/insights section, WhatsApp auto-message on booking, admin slot-block management UI, custom domain.
