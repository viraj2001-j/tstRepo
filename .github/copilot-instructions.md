# Copilot / AI Agent Instructions — Invoice App (Next.js + Prisma)

Purpose: give an AI coding assistant just enough, high-value context so it can be productive while making small-to-medium changes safely.

## Big picture
- This is a Next.js (App Router, Next v16) TypeScript app using server components by default and Tailwind + shadcn UI.
- Core domain: invoicing. Main domain models live in `prisma/schema.prisma` (`User`, `Client`, `Company`, `Invoice`, `InvoiceItem`, `Category`).
- DB: PostgreSQL accessed via Prisma. Prisma client is generated to `app/generated/prisma` and accessed via `import prisma from '@/lib/db'`.
- Auth: `next-auth` (credentials provider with bcrypt), with JWT session strategy. Auth configuration: `app/api/auth/[...nextauth]/route.ts`; types extended in `types/next-auth.d.ts`.
- API routes live under `app/api/*` using Next.js route handlers (`route.ts` / `route.tsx`). UI pages/components live under `app/*`. Client components include the "use client" directive.
- Middleware (`middleware.ts`) enforces auth for `/dashboard`, `/admin`, `/superadmin` and allows `/public` unprotected routes.

## How to run & common commands
- Install: `npm install` (or `pnpm install` / `yarn`).
- Dev server: `npm run dev` (starts Next dev at http://localhost:3000).
- Build / start: `npm run build` then `npm start`.
- Lint: `npm run lint` (ESLint).

Prisma & DB:
- Generate client: `npx prisma generate` (client output configured to `app/generated/prisma`).
- Create / apply migrations: `npx prisma migrate dev --name <desc>`.
- Seed: `npx prisma db seed` (seed command runs `tsx prisma/seed.ts` per `prisma.config.ts`).

## Environment variables (required / important)
- `DATABASE_URL` — Postgres connection for Prisma.
- `NEXTAUTH_SECRET` — NextAuth middleware/callbacks.
- `JWT_SECRET` — used to sign/verify custom JWTs in `lib/jwt.ts`.
- `NEXT_PUBLIC_BASE_URL` — base URL for public links (defaults to `http://localhost:3000`).
- `GMAIL_USER` / `GMAIL_APP_PASSWORD` — used by `app/api/invoice/sendemail/route.tsx` (nodemailer) during email sending.
- `RESEND_API_KEY` — used by `app/api/invoice/signature/route.tsx` (Resend email usage).

## Patterns & conventions (do this in this codebase)
- Server vs Client:
  - Files under `app/` are server components by default; add `"use client"` at the top for client components (forms, hooks, event handlers).
  - Use `useSession()` only in client components; server components should use server helpers or `getServerSession` when needed (see `app/superadmin/settings/page.tsx` comment).
- API handlers: `app/api/<resource>/route.ts(x)` exported handlers should be small and call `prisma` through `@/lib/db` (don't create new Prisma clients). Prefer passing typed inputs (Zod type checks exist in `lib/validators` using `zod` + `react-hook-form`).
- Authorization: Use `role` field from NextAuth token or session. Values used: `"ADMIN"`, `"SUPERADMIN"` — check `middleware.ts` for example logic.
- Email + PDF:
  - PDF generation helper: `lib/PDFgenerator.ts` (used by UI pages like `app/dashboard/invoices/...` and `app/public/invoice/[id]/PublicInvoiceView.tsx`).
  - Email sending: `app/api/invoice/sendemail/route.tsx` (nodemailer) and Resend usage in `app/api/invoice/signature/route.tsx`.

## Files to inspect for related changes (quick references)
- DB & codegen: `prisma/schema.prisma`, `prisma.config.ts`, `prisma/seed.ts`.
- Prisma client usage: `lib/db.ts` and imports to `@/app/generated/prisma`.
- Auth: `app/api/auth/[...nextauth]/route.ts`, `middleware.ts`, `types/next-auth.d.ts`.
- Invoices UI: `app/dashboard/invoices/*` (listing, new, view, signature upload); server-side API endpoints in `app/api/invoice/*`.
- UI components: `components/ui/*` (shadcn-style) and `components/*`.

## Safety rules for AI edits (concrete, repo-specific)
- If you change DB schema, add/describe a migration and run `npx prisma generate` and `npx prisma migrate dev`; update any UI code that reads the changed fields (search for `.invoice.` or `.user.` usages where applicable).
- Do not create a second Prisma client instance. Use the export from `lib/db.ts` (singleton pattern is applied there).
- For auth changes, keep NextAuth callbacks in `app/api/auth/[...nextauth]/route.ts` consistent with `types/next-auth.d.ts` (update types in tandem).
- Preserve middleware route protection logic unless explicitly changing auth rules — always update `middleware.ts` matcher if adding new protected routes.
- For email features, keep env var usage consistent (`GMAIL_USER`, `GMAIL_APP_PASSWORD`, `RESEND_API_KEY`) and avoid committing secrets.

---
If anything important is missing or you'd like the guidance to include more examples (e.g., code snippets for a typical migration or a sample `route.ts` handler), tell me which area to expand and I will iterate. ✅

<!-- End of file -->