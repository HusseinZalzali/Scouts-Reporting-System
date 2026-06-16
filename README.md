# 🏕️ Scout Daily Reporting System — نظام التقارير اليومية للأفواج الكشفية

تطبيق ويب عربي بالكامل (RTL) لأتمتة التقارير اليومية لكل فوج كشفي، مع مصادقة،
لوحات تحكم، تصفية، رسوم بيانية، وتصدير Excel/PDF.

A modern, Arabic-first full-stack web app that automates daily reporting for each
Scout group (فوج) — with authentication, dashboards, filtering, charts, and exports.

---

## ✨ Features

### مستخدم الفوج (Group User)
- تسجيل الدخول والوصول للوحة تحكم خاصة
- إنشاء تقرير يومي وتعديل تقرير اليوم
- **منع تكرار** التقرير لنفس اليوم (قيد فريد على مستوى قاعدة البيانات)
- **حفظ تلقائي للمسودات** (auto-save) أثناء الكتابة
- عرض التقارير السابقة + الطباعة
- نموذج متجاوب (mobile-first)

### المدير (Admin)
- لوحة تحكم بإحصائيات (أفواج، تقارير، حضور اليوم، حضور الشهر)
- عرض جميع التقارير مع **تصفية** (نطاق تاريخ، فوج، مكان) و**بحث**
- إجماليات الحضور اليومية والشهرية
- **تصدير Excel و PDF**
- **رسوم بيانية**: الحضور عبر الزمن، والحضور حسب الفوج
- طباعة ملخص التقرير

### عام
- واجهة عربية RTL مع خط **29LT Adir**
- دعم الوضع الداكن (Dark mode)
- تحقق من المدخلات بـ Zod ورسائل خطأ بالعربية
- حالات تحميل (loading)، حدود أخطاء (error boundaries)، وحالات فارغة (empty states)

---

## 🧱 Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Framework    | Next.js 15 (App Router) + TypeScript |
| Styling      | TailwindCSS (RTL, dark mode)        |
| Database     | PostgreSQL (Supabase / Neon)        |
| ORM          | Prisma                              |
| Auth         | Auth.js (NextAuth v5) — JWT sessions |
| Charts       | Recharts                            |
| Exports      | ExcelJS (Excel) + jsPDF (PDF)       |
| Validation   | Zod                                 |
| Deployment   | Vercel                              |

State changes use **server actions** (`src/app/actions/*`); file downloads use a
route handler (`src/app/api/export`).

---

## 📁 Folder Structure

```
.
├── prisma/
│   ├── schema.prisma          # DB schema (User, ScoutGroup, DailyReport, ProgramItem)
│   └── seed.ts                # Seed: admin + sample groups/users + sample reports
├── public/fonts/              # Drop 29LT Adir .woff2 files here
├── src/
│   ├── auth.ts                # Auth.js (Node runtime: Prisma + bcrypt)
│   ├── auth.config.ts         # Edge-safe auth config (route protection)
│   ├── middleware.ts          # Protects routes, redirects by role
│   ├── app/
│   │   ├── layout.tsx         # Root layout (RTL, theme provider, fonts)
│   │   ├── page.tsx           # Role-based redirect
│   │   ├── login/             # /login
│   │   ├── (app)/             # Authenticated shell (sidebar + layout)
│   │   │   ├── dashboard/     # Group dashboard
│   │   │   ├── reports/       # /reports, /reports/new, /reports/[id]
│   │   │   ├── admin/         # /admin, /admin/reports, /admin/analytics
│   │   │   └── settings/      # /settings
│   │   ├── print/reports/[id] # Clean print view
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/  # Auth.js handlers
│   │   │   └── export/        # Excel / PDF download
│   │   └── actions/           # Server actions (auth.ts, reports.ts)
│   ├── components/            # UI primitives, sidebar, charts, forms, tables
│   ├── lib/                   # prisma, queries, validations, utils, session, export
│   └── types/                 # next-auth type augmentation
├── .env.example
└── README.md
```

---

## 🗄️ Database Schema

- **User** — `id, name, username (unique), passwordHash, role (ADMIN|GROUP), scoutGroupId?`
- **ScoutGroup** — `id, name (unique)`
- **DailyReport** — `id, scoutGroupId, reportDate (date), location, attendance{Baraem,Ashbal,Kashafa,Jawala,Qada}, status (DRAFT|SUBMITTED), submittedById`
  - Unique constraint `(scoutGroupId, reportDate)` → **one report per group per day**
- **ProgramItem** — `id, reportId, order, text` (relational `program_items`)

---

## 🚀 Local Setup

### 1. Prerequisites
- Node.js 18.18+ (tested on Node 22)
- A PostgreSQL database — create a free one on [Supabase](https://supabase.com) or [Neon](https://neon.tech)

### 2. Install
```bash
npm install
```

### 3. Environment
```bash
cp .env.example .env
```
Fill in:
- `DATABASE_URL` — pooled connection string
- `DIRECT_URL` — direct (non-pooled) connection string (for migrations)
- `AUTH_SECRET` — generate with `openssl rand -base64 32`

> **Supabase tip:** use the *Connection Pooling* string (port `6543`) for
> `DATABASE_URL` and the *Direct connection* string (port `5432`) for `DIRECT_URL`.

### 4. Create schema & seed
```bash
npm run db:push      # push schema to the database
npm run db:seed      # create admin, sample groups/users, sample reports
```

### 5. Run
```bash
npm run dev
```
Open http://localhost:3000

### 🔑 Seed Credentials
| Role  | Username | Password      |
| ----- | -------- | ------------- |
| Admin | `admin`  | `Admin@12345` |
| فوج 1 | `group1` | `Group@12345` |
| فوج 2 | `group2` | `Group@22345` |
| فوج 3 | `group3` | `Group@32345` |
| فوج 4 | `group4` | `Group@42345` |

(Admin credentials are configurable via `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD`.)

---

## 🔤 29LT Adir Font

29LT Adir is a **commercial** typeface. Purchase/license it from
[29lt.com](https://29lt.com/font/29lt-adir/) and place the web fonts in:

```
public/fonts/29LTAdir-Regular.woff2
public/fonts/29LTAdir-Medium.woff2
public/fonts/29LTAdir-Bold.woff2
```

The `@font-face` rules are already wired up in `src/app/globals.css`. If the files
are missing the UI falls back to the system Arabic UI font automatically.

---

## ☁️ Deploy to Vercel

1. Push the repo to GitHub.
2. In Vercel → **New Project** → import the repo.
3. Add the **Environment Variables** (Project → Settings → Environment Variables):
   - `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`
   - `AUTH_URL` is set automatically by Vercel; you may omit it.
4. The build command runs `prisma generate && next build` (already configured in
   `package.json`). Deploy.
5. **Initialize the database** (once) from your machine, pointing at the production DB:
   ```bash
   npm run db:push
   npm run db:seed
   ```
   Or run `prisma migrate deploy` if you prefer migration files.

> The `/api/export` route uses the Node.js runtime (ExcelJS / jsPDF), which Vercel
> serverless functions support out of the box.

### Note on Arabic PDFs
jsPDF's core fonts don't shape Arabic script. The Excel export is fully Arabic.
For fully shaped Arabic PDFs, embed an Arabic font (e.g. Amiri) in
`src/lib/export.ts` via `doc.addFont(...)`. The current PDF export is functional
out of the box and keeps Arabic text in the program/location columns.

---

## 📜 Scripts

| Script             | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start dev server                     |
| `npm run build`    | `prisma generate` + production build |
| `npm start`        | Start production server              |
| `npm run db:push`  | Push Prisma schema to DB             |
| `npm run db:migrate` | Create & apply a migration         |
| `npm run db:seed`  | Seed the database                    |
| `npm run db:studio`| Open Prisma Studio                   |
| `npm run lint`     | Lint                                 |

---

## 📋 Report Template (Arabic)

```
اسم الفوج:
مكان الاحياء:

برنامج الاحياء:
1.
2.
3.
4.

الحضور:
براعم:
اشبال:
كشافة:
جوالة:
قادة:
```
