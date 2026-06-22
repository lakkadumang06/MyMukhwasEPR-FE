# MyMukhwas ERP — FRONTEND Specification (FE-SPEC)

> **Status:** DRAFT v0.1 — for review (NO CODE yet)
> **Stack:** Next.js (App Router) + React + TypeScript + Tailwind + shadcn/ui
> **Reads with:** [`docs/00-MASTER-SPEC.md`](../docs/00-MASTER-SPEC.md) and [`BE/BE-SPEC.md`](../BE/BE-SPEC.md)
> **Per-module detail:** [`FE/docs/modules/`](./docs/modules/) — one file per module.

---

## 1. What the frontend is

A clean, fast **web dashboard app** that replaces the Google Sheets workbook. It is a *thin* client:
it shows data and collects input — **all numbers/rules come from the backend**. The team should feel
"it's like my Excel, but it updates itself and never breaks formulas."

Primary users: Owner (admin) + 6 staff on desktop; mobile-friendly for sales/attendance on the go.

---

## 2. Tech stack & versions

| Concern | Choice | Why |
|--------|--------|-----|
| Framework | **Next.js 14 (App Router)** + TypeScript | routing, layouts, fast, easy hosting (Vercel) |
| Styling | **Tailwind CSS** | utility-first, consistent |
| UI components | **shadcn/ui** (Radix under the hood) | accessible, themeable building blocks |
| Icons | **lucide-react** | matches the sheet's icon vibe |
| Server state / data | **TanStack Query (React Query)** | caching, refetch, optimistic updates |
| Tables | **TanStack Table** | the "Excel-like" grid your team expects |
| Charts | **Recharts** | pie/bar/line for dashboard & reports |
| Forms | **React Hook Form + Zod** | type-safe validation mirroring backend DTOs |
| HTTP | **Axios** instance | interceptors for auth + envelope unwrap |
| Auth state | lightweight **Zustand** store + httpOnly-ish token handling | current user, role, token |
| Dates/money | **dayjs** + Intl.NumberFormat('en-IN') | DD.MM.YYYY + ₹1,67,601 |
| Notifications | **sonner** (toasts) | success/error feedback |

---

## 3. Folder structure

```
FE/
├── app/                              # Next.js App Router
│   ├── (auth)/login/page.tsx         # public login
│   ├── (app)/                        # authed shell (sidebar + topbar)
│   │   ├── layout.tsx                # guards auth, renders Sidebar + Topbar + AlertsBell
│   │   ├── dashboard/page.tsx
│   │   ├── products/page.tsx
│   │   ├── recipe-bom/page.tsx
│   │   ├── raw-materials/page.tsx
│   │   ├── vendors/page.tsx
│   │   ├── purchases/page.tsx
│   │   ├── stock/raw-materials/page.tsx
│   │   ├── stock/batches/page.tsx
│   │   ├── price-trends/page.tsx
│   │   ├── production/page.tsx
│   │   ├── stock/finished/page.tsx
│   │   ├── sales/page.tsx
│   │   ├── returns/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── credit-udhaar/page.tsx
│   │   ├── team/page.tsx
│   │   ├── salary-expenses/page.tsx
│   │   ├── reports/sales/page.tsx
│   │   ├── reports/profit-loss/page.tsx
│   │   └── investment/page.tsx
│   └── layout.tsx                    # root: providers (QueryClient, Toaster, fonts)
├── components/
│   ├── ui/                           # shadcn primitives (button, input, dialog, table...)
│   ├── layout/                       # Sidebar, Topbar, AlertsBell, PageHeader
│   ├── data/                         # DataTable, ColumnHeader, Pagination, Filters
│   ├── form/                         # FormField, MoneyInput, DatePicker, SelectAsync
│   ├── charts/                       # LineChart, PieChart, BarChart, DonutChart wrappers
│   └── common/                       # KpiCard, StatusBadge, Money, EmptyState, ConfirmDialog
├── features/                         # one folder per module: api hooks + types + module-specific UI
│   ├── products/{api.ts,types.ts,columns.tsx,ProductForm.tsx}
│   ├── purchases/...
│   └── ...                           # mirrors backend modules
├── lib/
│   ├── api-client.ts                 # axios instance (baseURL, auth header, unwrap envelope)
│   ├── query-client.ts               # TanStack Query config
│   ├── auth-store.ts                 # Zustand: user, token, login/logout
│   ├── format.ts                     # inr(), date(), percent()
│   └── rbac.ts                       # can(role, action) helpers for menu/buttons
├── .env.local.example                # NEXT_PUBLIC_API_URL=http://localhost:4000/api
└── docs/modules/                     # this folder: 1 MD per module
```

> **Pattern:** `components/` = generic & reusable; `features/<module>/` = that module's data hooks, table columns, and form. Pages stay tiny (compose feature pieces).

---

## 4. Navigation (the tabs/sidebar)

Sidebar grouped to match the mental model from your sheet index:

- **Overview** → Dashboard
- **Masters** → Products, Recipe/BOM, Raw Materials, Vendors, Customers
- **Purchasing** → Purchase Entry, Stock Batches (FIFO), Raw Material Stock, Price Trends
- **Production** → Production Entry, Finished Stock
- **Sales** → Sales Entry, Returns, Credit/Udhaar
- **Team** → Team & Attendance, Salary & Expenses
- **Reports** → Sales Report, Profit & Loss, Investment & ROI

Menu items are **filtered by role** (see §9). Active route highlighted. Collapsible on mobile.

---

## 5. App shell & layout

- **Sidebar** (left): grouped nav, MyMukhwas logo, role badge, logout.
- **Topbar:** page title (breadcrumb), global search, **AlertsBell** (count of low-stock/pending/udhaar), user menu.
- **AlertsBell** opens the same alerts feed shown on the dashboard (from `/api/dashboard/alerts`).
- Content area: `PageHeader` (title + primary action button, e.g. "New Purchase") then the table/form/charts.

---

## 6. Design system

- **Colors:** keep the sheet's identity — deep blue headers (`#1f4e79`), red banners for titles, green for positive/OK, amber for warning, red for negative/out. Tailwind theme tokens: `primary` (blue), `success`, `warning`, `danger`.
- **Money:** `<Money value={1676.5} />` → `₹1,676.50` (en-IN grouping); negative in red.
- **Status:** `<StatusBadge>` maps enum → colour (OK=green, Low=amber, Out/negative=red, Not Started=grey, Paid=green, Pending=amber).
- **Dates:** `DD.MM.YYYY` display (matches `21.5.2026` in your sheets).
- **Density:** compact tables (Excel-like), zebra rows, sticky header, right-aligned numbers.
- **Typography:** system/Inter; tabular-nums for figures.

---

## 7. Shared components (build once, reuse everywhere)

| Component | Purpose |
|-----------|---------|
| `DataTable` | TanStack Table wrapper: sorting, pagination, column filters, search, sticky header, row actions, CSV export. Every list page uses it. |
| `KpiCard` | dashboard metric card (label, value, delta, icon, colour). |
| `Money` / `Percent` | formatted numeric display. |
| `StatusBadge` | enum → coloured pill. |
| `FormField` | label + control + error, wired to RHF. |
| `MoneyInput`, `DatePicker`, `SelectAsync` | typed inputs; `SelectAsync` loads options from an API (e.g. pick a vendor/product). |
| `ChartCard` | titled card wrapping a Recharts chart with loading/empty states. |
| `ConfirmDialog` | delete/critical confirmations. |
| `EmptyState`, `Loading`, `ErrorState` | consistent async states. |
| `PageHeader` | title + actions. |

---

## 8. Data fetching & state

- **TanStack Query** for all server data. Query keys per module: `['products', filters]`.
- **Mutations** (create/update/delete) invalidate the relevant queries → tables auto-refresh.
- **Optimistic UI** for fast actions (e.g. toggling status), with rollback on error.
- **No global cache of business data** beyond Query; only **auth/user** lives in Zustand.
- Derived screens (stock, reports, dashboard) just GET computed data — never recompute on client.

### API client
`lib/api-client.ts` (axios): sets `baseURL = NEXT_PUBLIC_API_URL`, attaches `Authorization: Bearer <token>`, **unwraps** the `{ success, data }` envelope so hooks get clean data, and routes 401 → logout.

---

## 9. Auth & role-based UI

- **Login page** (public) → calls `/api/auth/login`, stores token + user in Zustand (and persisted).
- `(app)/layout.tsx` redirects to `/login` if not authed.
- **`rbac.ts`** `can(role, action)` controls: which **menu items** show, which **buttons** (create/edit/delete) render, and which **pages** redirect (defence in depth — backend still enforces).
- Role → menu mapping mirrors [`docs/00-MASTER-SPEC.md`] §7.

---

## 10. Forms & validation

- **React Hook Form + Zod**. Each module's Zod schema mirrors the backend DTO (same rules) so errors are caught before the request.
- Inline field errors, disabled submit while pending, toast on success/failure.
- Money inputs store numbers (not strings); selects store codes/ids.
- Auto-calculated fields (total, profit, margin) are **read-only previews**; the authoritative value comes back from the server on save.

---

## 11. Tables (the Excel feeling)

- `DataTable` gives sortable columns, per-column filters, global search, pagination (server-side), sticky header, inline row actions (edit/delete/view), and **CSV export** (so they can still "download to Excel").
- Numeric columns right-aligned, `tabular-nums`, coloured by sign.
- Status columns use `StatusBadge`.

---

## 12. Charts (dashboard & reports)

Recharts wrappers in `components/charts`:
- **LineChart** — sales trend.
- **PieChart/DonutChart** — sales by channel; stock value by category.
- **BarChart** — top products; revenue vs COGS vs profit.
All fed by backend aggregation endpoints; show loading/empty states.

---

## 13. Localization & formatting

- INR via `Intl.NumberFormat('en-IN', { style:'currency', currency:'INR' })`.
- Dates via dayjs `DD.MM.YYYY`.
- Domain words kept (Udhaar, Kharcha, Batch). **[CONFIRM]** if you want Hindi/Gujarati UI labels (we can add an i18n layer).

---

## 14. Errors, loading, empty, toasts

- Every async area renders `Loading` → `ErrorState` (with retry) → `EmptyState` → data.
- Mutations show `sonner` toasts (success/fail with backend message).
- Form 400s map field errors back onto inputs.

---

## 15. Performance & UX

- Server-side pagination/filtering (don't load whole collections).
- Code-split per route (App Router does this).
- Skeleton loaders for tables/cards.
- Responsive: sidebar collapses, tables scroll horizontally on mobile; sales & attendance forms are mobile-first.

---

## 16. 📐 Module-doc TEMPLATE (every file in `FE/docs/modules/` follows this)

```markdown
# <NN> — <Module Name> (Frontend)

## 1. Purpose & route
What the screen is for; URL path; which roles can see it.

## 2. Page layout
ASCII wireframe / description: header, filters, table/form/charts arrangement.

## 3. Components used
Which shared components + the module-specific ones (columns, form).

## 4. Data & API hooks
TanStack Query hooks (list/detail/create/update/delete) and the endpoints they call (link to backend doc). Query keys.

## 5. Table columns   (for list screens)
Column | source field | format | sortable | filter.

## 6. Form fields   (for create/edit screens)
Field | input type | Zod rule | options source | notes. Mark read-only auto-calculated previews.

## 7. Charts / KPIs   (for dashboard/report screens)
Each chart: type, data source endpoint, dimensions/measures.

## 8. Interactions & states
Actions (new/edit/delete/export), confirmations, optimistic updates, loading/empty/error.

## 9. Validation (client mirror)
Zod schema summary mirroring the backend DTO.

## 10. Open questions [CONFIRM]
```

---

## 17. Open questions (frontend-specific)

1. **UI language:** English only, or add Hindi/Gujarati labels?
2. **Branding:** logo/colours — keep the blue/red sheet identity, or a fresh theme?
3. **Excel export** needed on every table? (recommended yes — eases the transition)
4. **Mobile priority:** which screens must work great on phone (sales? attendance?)
5. **Single full-stack Next.js** vs separate FE/BE — confirm (this doc assumes separate; if combined, API hooks call internal route handlers instead).

*End FE-SPEC v0.1 — confirm conventions, then I'll write each `docs/modules/*.md` to this template.*
