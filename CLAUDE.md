# Scout Daily Reporting System — Project Notes

## Auto-push workflow (standing instruction)

After making changes, **once everything is verified good, commit and push to GitHub `origin/main` without being asked.**

"Verified good" means, in order:
1. `npx tsc --noEmit` passes (no type errors), and
2. `npx next build` succeeds.

Only after both pass:
3. `git add -A`
4. `git commit` with a clear message (end with the `Co-Authored-By: Claude Opus 4.8` trailer)
5. `git push origin main`

Do **not** push if typecheck or build fails — report the failure instead and fix it first.
Never commit secrets: `.env` is gitignored and must stay that way.

## Project facts
- Stack: Next.js 15 (App Router) + TypeScript + Prisma + Auth.js + TailwindCSS, Supabase Postgres.
- GitHub remote: https://github.com/HusseinZalzali/Scouts-Reporting-System (branch `main`).
- Deploys to Vercel, region pinned to `iad1` (matches Supabase us-east-1) via `vercel.json`.
- DB connection reads `POSTGRES_PRISMA_URL` (pooled) + `POSTGRES_URL_NON_POOLING` (direct) — the vars Vercel's Supabase integration injects; mapped locally in `.env`. A Prisma retry wrapper (`src/lib/prisma.ts`) handles cold-pooler errors.
- Fonts: 29LT Adir self-hosted via `next/font/local` (OTFs in `src/fonts/`).
- Seed accounts: admin `admin`, groups `group1`–`group4` (see `prisma/seed.ts`).
