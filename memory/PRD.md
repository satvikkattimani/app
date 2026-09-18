# PRD — Satvik Capital · Financial Advisory

## Original Problem Statement
Luxurious, visibility-focused website for Satvik Kattimani's personal financial advisory practice, branded **Satvik Capital** (India). Must include: AI concierge chatbot, direct customer service (phone 9740542188 / email satvikkinvestments@gmail.com, no ticketing), free consultation / portfolio-restructuring booking synced to Google Calendar, About (Bachelor's in Investment Banking + AMC internship in mutual fund ideation & execution = his edge), services, testimonials, SIP calculator, Direct vs Regular plan comparison, multilingual Hindu-traditional intro. Wording: "Financial Advisor" everywhere; "AMFI-Registered Mutual Fund Distributor · ARN-349743" appears ONLY in the footer copyright line.

## User Personas
- HNI visitor / prospective client: explores, uses SIP engine, reads Direct vs Regular, chats, books.
- Existing client: direct phone/WhatsApp/email.
- Satvik (admin): manages bookings, connects Google Calendar, receives booking email alerts.

## Architecture
- Frontend: React + Tailwind + shadcn/ui + framer-motion + lenis (smooth scroll) + recharts. Theme: deep navy (#0B1528) + burnished copper (#C76A3D) + handmade paper (#F9F6F0), Cormorant Garamond / Manrope / IBM Plex Mono, grain overlay. Logo: copper compass/Ashta-Lakshmi emblem at `/public/brand/logo.png`. Pages: Landing `/`, Admin Login `/admin/login`, Admin Dashboard `/admin`.
- Landing order: Intro overlay → Navbar → Hero (masked line reveal, scroll-parallax compass) → Marquee → About/Edge → 4 numbered Chapters → SIP Engine → Direct vs Regular → Booking → Direct Desk → Stories → Footer; floating Chat concierge.
- Backend: FastAPI (`/api`). JWT cookie auth (admin seeded from env, lockout), SSE chatbot (emergentintegrations gpt-5.4-mini, rebranded compliant prompt), slots Mon–Sat 10:00–17:00 IST, appointments CRUD, Google Calendar OAuth (dormant until GOOGLE_CLIENT_ID/SECRET), booking email alert via Emergent email proxy (EMERGENT_EMAIL_KEY, EMAIL_FROM_NAME=Satvik Capital, NOTIFY_EMAIL, background task, guardrail gate).
- DB: MongoDB — users, appointments (notified flag), chat_sessions, chat_messages, login_attempts, google_tokens.

## Core Requirements (static)
- Contact 9740542188 / satvikkinvestments@gmail.com prominent; no ticketing.
- MFD/ARN line only in footer; disclaimer in footer.
- Booking: free consultation / restructuring, slot picker, confirmation, owner email alert, calendar sync when connected.

## Implemented
- 2026-08-04: v1 black/gold site, chatbot, booking, admin dashboard, Google Calendar code.
- 2026-09-18: Full redesign (navy/copper/paper), rebrand to Satvik Capital + generated logo, multilingual intro (10 scripts → SATVIK CAPITAL, skip, once per session), lenis smooth scroll, kinetic hero, marquee, About/Edge (education + AMC internship), 4 chapters, SIP calculator (sliders + recharts), Direct vs Regular section (matrix + 20-yr illustrative chart, assumptions footnote), "Financial Advisor" wording, booking email alerts to owner (verified 202 Accepted), chatbot prompt rebranded, admin pages rethemed, favicon/title/meta. Tested: /app/test_reports/iteration_1.json — all pass.

## Backlog
- P0: User to provide Google OAuth Client ID/Secret (redirect URI `<FRONTEND_URL>/api/oauth/calendar/callback`) → add to backend/.env, restart, connect from admin dashboard.
- P0: Replace placeholder portrait (About.jsx PORTRAIT) and 3 placeholder testimonials (Testimonials.jsx) with real content from user.
- P1: Client-facing booking confirmation email (only if requested; keep guardrails).
- P2: Blog/insights, WhatsApp auto-message on booking, admin slot-blocking UI, custom domain, intro sound toggle.
