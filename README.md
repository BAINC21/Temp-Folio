# Folio — Client Portal for Freelancers

Branded portals, project tracking, file sharing, and invoicing.

## Tech Stack

- **Next.js 14** — App Router, Server Components
- **Supabase** — Auth (magic links) + File Storage
- **Prisma** — ORM on top of Supabase's Postgres
- **Tailwind CSS** — Styling
- **Vercel** — Hosting

## Quick Start

```bash
npm install
cp .env.example .env   # fill in Supabase credentials
npx prisma db push     # create database tables
npm run dev             # http://localhost:3000
```

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to Settings → API → copy URL and anon key into `.env`
3. Go to Settings → Database → copy connection strings into `.env`
4. Create a storage bucket called `project-files` (public)
5. Enable Email auth with magic links in Authentication → Providers

## Project Structure

```
folio/
├── app/
│   ├── (dashboard)/              # Authenticated layout group
│   │   ├── layout.tsx            # Sidebar + navigation shell
│   │   ├── page.tsx              # Dashboard (home)
│   │   ├── project/[id]/page.tsx # Project detail view
│   │   ├── clients/page.tsx      # Client list + add client
│   │   ├── files/page.tsx        # All files across projects
│   │   └── settings/page.tsx     # Profile, branding, billing
│   ├── portal/[slug]/page.tsx    # Client portal (separate layout)
│   ├── login/page.tsx            # Auth page
│   ├── globals.css
│   └── layout.tsx                # Root layout
├── components.tsx                # All shared UI components
├── mock-data.ts                  # Mock data (replace with Prisma queries)
├── lib.ts                        # Prisma client + Supabase client + queries
├── supabase-server.ts            # Server-side Supabase client
├── middleware.ts                  # Auth protection
├── prisma/schema.prisma          # Database schema
├── tailwind.config.js
├── package.json
└── README.md
```

## Routes

| Route | Description |
|---|---|
| `/` | Dashboard — stats, active projects, activity feed |
| `/project/[id]` | Project detail — milestones, files, activity |
| `/clients` | Client list with search, add new client |
| `/files` | All files across projects with filters |
| `/settings` | Profile, branding, billing settings |
| `/portal/[slug]` | Client-facing portal (light theme) |
| `/login` | Sign in / sign up |

## Roadmap

- [x] Dashboard, project view, client portal UI
- [x] Database schema (Prisma + Supabase Postgres)
- [x] Supabase auth + middleware
- [x] File storage helpers
- [x] Clients page with search & add
- [x] Files page with filtering
- [x] Settings page (profile, branding, billing)
- [x] Route-based file structure with shared layout
- [ ] Wire UI to real Prisma queries
- [ ] Magic link client login
- [ ] Stripe invoicing
- [ ] Email notifications
- [ ] Custom domains

## License

MIT
