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
│   ├── globals.css           # Tailwind
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Dashboard entry
│   └── dashboard-client.tsx  # Interactive dashboard + project + portal
├── components.tsx            # All shared UI components
├── lib.ts                    # Prisma client + Supabase client + queries
├── supabase-server.ts        # Server-side Supabase client
├── middleware.ts             # Auth protection
├── prisma/schema.prisma      # Database schema
├── tailwind.config.js
├── package.json
└── README.md
```

## Roadmap

- [x] Dashboard, project view, client portal UI
- [x] Database schema (Prisma + Supabase Postgres)
- [x] Supabase auth + middleware
- [x] File storage helpers
- [ ] Wire UI to real Prisma queries
- [ ] Magic link client login
- [ ] Stripe invoicing
- [ ] Email notifications
- [ ] Custom domains

## License

MIT
