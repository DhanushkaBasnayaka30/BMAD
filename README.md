# FixNear

A free, mobile-first web marketplace that helps customers in Sri Lanka find nearby repair technicians and contact them directly on WhatsApp.

**Status:** Planning complete. Implementation is starting (Phase 1, Negombo pilot).

## What it does

- **Customers** browse repair providers by area and service, with no login, and tap a button to message a provider on WhatsApp.
- **Providers** register with a mobile number and password, build a profile (services, areas served, photos, visiting fee), and manage their listing.
- **Admin** reviews and verifies each provider before the listing goes public.

Phase 1 has no fees, payments or commissions.

## Pilot scope

- Launch areas: Negombo, Kochchikade, Katunayake and Seeduwa
- Target: 15 to 25 verified providers before any marketing
- Sri Lanka only
- Primary metric: WhatsApp contact clicks (approximate)

## Tech stack

- **Frontend and backend:** Next.js (App Router), as a modular monolith with three route groups: `(public)`, `(provider)`, `(admin)`
- **Database, auth and storage:** Supabase (Postgres, Auth, Storage), Mumbai region (ap-south-1)
- **Data fetching:** TanStack Query
- **Spam protection:** Cloudflare Turnstile, with rate limiting in Postgres
- **Alerts:** Telegram bot
- **Hosting:** Vercel

## Project structure

```
_bmad-output/
  planning-artifacts/   Brief, PRD, UX design, architecture, data model, epics
  implementation-artifacts/
    sprint-status.yaml  Status of every epic and story
src/                    Application code (added during implementation)
```

Key documents:

| Document | Purpose |
|---|---|
| `_bmad-output/planning-artifacts/epics.md` | 7 epics and 50 stories with acceptance criteria |
| `.../architecture/.../ARCHITECTURE-SPINE.md` | Architecture decisions |
| `.../architecture/.../DATA-MODEL.md` | Database schema, triggers and security policies |
| `.../ux-designs/.../DESIGN.md` and `EXPERIENCE.md` | Visual design and user flows |

## Getting started

> The app has not been scaffolded yet. Commands below will be confirmed once the scaffolding story (Epic 1) is done.

Requirements:

- Node.js (LTS version to be confirmed in the scaffolding story)
- A Supabase project (use a separate project for development and production)

```bash
# 1. Clone the repository
git clone <repository-url>
cd <repository-folder>

# 2. Install dependencies
npm install

# 3. Create your local environment file
cp .env.local.example .env.local
# Fill in your own values. Never commit .env.local.

# 4. Start the development server
npm run dev
```

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in your own values. The example file contains variable names only, never real keys.

Expected variables include the Supabase URL and keys, the Turnstile keys, the Telegram bot details, `PHONE_BLOCKLIST_SECRET`, and `NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER`.

## Security rules

- Never commit `.env*` files. Only `.env.local.example` is tracked.
- Server-only secrets (service-role key, `PHONE_BLOCKLIST_SECRET`, Turnstile secret, Telegram token) stay in `.env.local` and in Vercel environment variables.
- AI agents must never read or edit `.env` files.
- Use separate Supabase projects for development and production.
- Rotate any key that may have been exposed.

## Development workflow

This project is built with the [BMAD Method](https://github.com/bmad-code-org/BMAD-METHOD) using the Antigravity CLI.

1. Start the agent in the project folder: `agy`
2. Check the next step: `/bmad-help`
3. Build one story at a time, each in a fresh session: `/bmad-build <story-id>`
4. Review the diff and tests before moving to the next story.
5. Story status is tracked in `_bmad-output/implementation-artifacts/sprint-status.yaml`.

Build order:

1. Epic 1: Foundation (Supabase, phone-auth spike, scaffolding, schema)
2. Epics 2 to 6: Provider onboarding, admin verification, public discovery, profiles and WhatsApp contact, provider self-management
3. Epic 7: Launch readiness (security hardening, backups, accessibility, performance, pilot test)

## Contributing

- One owner per story. Shared files (schema, RLS policies, shared folders) have one owner at a time.
- Use a feature branch per story and open a pull request that says `Closes #<issue>`.
- Do not commit secrets or generated build output.

## License

To be decided.
