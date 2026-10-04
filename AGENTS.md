<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SwipeSense — AI Assistant Codebase & Architecture Guide

> **Target Audience:** AI Coding Assistants (Claude Code, Cursor, Copilot, Antigravity, Windsurf, Aider).  
> **Purpose:** Provide instant, comprehensive context on the application's architecture, data contracts, design system, component hierarchy, and coding standards without needing to read the entire codebase.

---

## 1. Executive Summary & Purpose

- **Application Name:** SwipeSense (`credit-card-expense-tracker-frontend`)
- **Domain:** Credit Card Expense, Limit Tracking & Personal Financial Discipline.
- **Core Problem Solved:** Credit cards typically enforce high credit limits (e.g., ₹1,00,000) with delayed billing statements, encouraging overspending. SwipeSense provides a dual-limit safety layer:
  1. **Bank Card Limit (Hard Limit):** Total credit line granted by the bank.
  2. **Personal Spending Limit (Soft Limit):** Self-imposed monthly budget (e.g., ₹10,000).
  3. **Real-Time Threshold Warnings:** Visual alert triggers when spending crosses a customizable threshold (default: 80% of personal limit), plus an EXCEEDED alert above 100%.
  4. **Bank SMS Parsing:** Users can paste SMS transaction alerts (or connect a webhook listener) to instantly extract merchant name, amount, date, and category in milliseconds without sharing bank credentials.

---

## 2. Tech Stack & Environment

| Layer | Technology | Details |
|---|---|---|
| **Framework** | Next.js 16.3.8 | App Router (`src/app`), React 19.2.8, React DOM 19.2.8 |
| **Language** | Modern JavaScript (ES6+) | Path aliases configured via `jsconfig.json` (`@/*` -> `./src/*`) |
| **Styling** | Vanilla CSS + CSS Modules | Custom design system in `src/app/globals.css`. **STRICT RULE: NO Tailwind CSS.** |
| **Typography** | Google Fonts | `Plus Jakarta Sans` (UI / headings), `JetBrains Mono` (financial numbers) |
| **Icons** | `lucide-react` (v1.50.0) | Standard SVG icon set throughout the app |
| **State & Auth** | React Context (`AuthContext`) | Synchronized with `localStorage` (`cc_token`, `cc_user`) |
| **HTTP Client** | Universal `fetch` wrapper | Implemented in `src/lib/api.js` with Bearer token injection |
| **Dev Port** | `http://localhost:3000` | Run via `npm run dev` |
| **Backend Target** | `http://localhost:5000/api` | Configured via `process.env.NEXT_PUBLIC_API_URL` |

---

## 3. Directory Structure & File Map

```
frontend/
├── package.json              # Next.js 16, React 19, Lucide React, ESLint 9
├── jsconfig.json             # Alias mapping: "@/*" -> ["./src/*"]
├── next.config.mjs           # Next.js configuration
├── eslint.config.mjs         # ESLint 9 flat configuration
├── AGENTS.md                 # Agent rules & context entry point
├── CLAUDE.md                 # Imports @AGENTS.md for Claude Code
├── public/                   # Static assets & icons
└── src/
    ├── app/
    │   ├── layout.js         # Root HTML shell, AuthProvider, Navbar, security footer
    │   ├── globals.css       # Complete custom Pastel Sage design system & utility classes
    │   ├── page.js           # Dashboard ("/") - Metrics, warning banner, transactions table
    │   ├── page.module.css   # Scoped dashboard layout styles
    │   ├── account/
    │   │   └── page.js       # Profile management & password change ("/account")
    │   ├── history/
    │   │   └── page.js       # Spending analytics, SVG bar chart, category breakdown ("/history")
    │   ├── limits/
    │   │   └── page.js       # Hard/soft limit configuration & live preview simulation ("/limits")
    │   ├── login/
    │   │   └── page.js       # User login page with demo account filler ("/login")
    │   └── register/
    │       └── page.js       # User registration & onboarding limit setup ("/register")
    ├── components/
    │   ├── Navbar.js         # Sticky header with active routes, user menu, mobile nav
    │   ├── AddTransactionModal.js # Expense modal: Manual entry tab + Bank SMS parser tab
    │   ├── DeleteConfirmationModal.js # Confirmation modal before deleting transactions
    │   ├── CustomDropdown.js # Accessible, custom popover menu replacing native <select>
    │   ├── PageHeader.js     # Standardized header with breadcrumb & actions slot
    │   └── TrackingGuideModal.js # Explanatory modal for SMS Sync, Account Aggregator, CSV
    ├── context/
    │   └── AuthContext.js    # Auth state, login/register/logout methods, route protection
    └── lib/
        └── api.js            # Unified API client mapping all backend endpoints
```

---

## 4. Key Entities & Data Models

### 4.1 User (`User`)
```typescript
interface User {
  _id: string;
  name: string;
  email: string;
  cardLimit: number;        // e.g. 100000 (Hard bank limit)
  personalLimit: number;    // e.g. 10000 (Soft monthly limit)
  alertThreshold: number;   // e.g. 80 (Percentage at which warning triggers)
  billingCycleDay: number;  // e.g. 1 (Day of month when billing cycle resets: 1-31)
  currencySymbol: string;   // '₹' | '$' | '€' | '£' | 'AED'
  cardName: string;         // e.g. "HDFC Millennia", "Primary Credit Card"
  cardLast4?: string;       // e.g. "4589"
  createdAt?: string;
}
```

### 4.2 Transaction (`Transaction`)
```typescript
interface Transaction {
  _id: string;
  userId: string;
  amount: number;
  merchant: string;
  category: TransactionCategory;
  date: string;             // ISO date string (YYYY-MM-DD)
  paymentMethod: string;    // 'Credit Card' | 'Debit Card' | 'UPI' | 'Netbanking'
  notes?: string;           // Encrypted field on backend (AES-256-GCM)
  source?: 'MANUAL' | 'SMS_PARSED' | 'STATEMENT_IMPORT' | 'API';
  createdAt?: string;
}

type TransactionCategory =
  | 'Dining'
  | 'Shopping'
  | 'Groceries'
  | 'Utilities'
  | 'Travel'
  | 'Entertainment'
  | 'Healthcare'
  | 'Education'
  | 'Subscriptions'
  | 'Fuel'
  | 'Other';
```

### 4.3 Limits Overview (`LimitsOverview`)
Returned by `GET /api/limits/overview`:
```typescript
interface LimitsOverview {
  cardLimit: number;
  personalLimit: number;
  alertThreshold: number;
  billingCycleDay: number;
  currencySymbol: string;
  cardName: string;
  totalSpent: number;           // Total spent within current billing cycle
  remainingPersonal: number;    // personalLimit - totalSpent
  remainingCard: number;        // cardLimit - totalSpent
  personalPercent: number;      // (totalSpent / personalLimit) * 100
  status: 'SAFE' | 'WARNING' | 'EXCEEDED'; // Computed status based on alertThreshold
}
```

---

## 5. API Client Reference (`src/lib/api.js`)

All requests go through the unified `request(endpoint, options)` helper. It automatically:
- Injects `Authorization: Bearer <token>` from `localStorage.getItem('cc_token')`.
- Sets `Content-Type: application/json`.
- Normalizes API error responses into structured `Error` objects (`error.message`, `error.status`, `error.data`).

| Method | Endpoint | Description | Payload / Query Params |
|---|---|---|---|
| `POST` | `/auth/login` | Authenticate user | `{ email, password }` |
| `POST` | `/auth/register` | Register new user | `{ name, email, password, cardLimit, personalLimit, cardLast4, alertThreshold }` |
| `GET` | `/auth/me` | Fetch active user profile | None |
| `PUT` | `/auth/update-profile` | Update user metadata | `{ name, cardName, cardLast4 }` |
| `PUT` | `/auth/update-password` | Change user password | `{ currentPassword, newPassword }` |
| `GET` | `/limits/overview` | Current cycle spend vs limits | None |
| `PUT` | `/limits` | Update user limits & cycle | `{ cardLimit, personalLimit, alertThreshold, billingCycleDay, currencySymbol, cardName }` |
| `GET` | `/transactions` | Filtered transaction list | `?category=&search=&month=&page=1&limit=15` |
| `POST` | `/transactions` | Record new transaction | `{ amount, merchant, category, date, paymentMethod, notes }` |
| `PUT` | `/transactions/:id` | Edit transaction | `{ amount, merchant, category, date, paymentMethod, notes }` |
| `DELETE` | `/transactions/:id` | Delete transaction | None |
| `POST` | `/transactions/parse-sms` | Parse raw bank SMS text | `{ smsText }` -> Returns `{ amount, merchant, category, date, cardLast4 }` |
| `POST` | `/transactions/bulk-import` | Bulk insert transactions | `{ items: Transaction[] }` |
| `GET` | `/analytics/monthly-history`| Historical cycle totals | `?months=6` (or 3, 12) |
| `GET` | `/analytics/categories` | Spend breakdown by category | `?month=YYYY-MM` (optional) |

---

## 6. Design System & Styling Architecture

The project employs a custom, refined **Pastel Sage & Lavender** aesthetic.  
**DO NOT install or use Tailwind CSS.** Follow these rules:

### 6.1 Color Palette Tokens (`src/app/globals.css`)
```css
/* Core Sage Green (Primary Actions & Brand) */
--sage-50: #F4F8F5;   --sage-100: #E6F0E9;  --sage-200: #CDE2D4;
--sage-300: #A8CEB6;  --sage-400: #7BAF8E;  --sage-500: #578E6C;
--sage-600: #427054;  --sage-700: #335741;

/* Slate / Lavender (Secondary Highlights & Quick Actions) */
--lavender-50: #F7F7FA;  --lavender-100: #EEF0F7; --lavender-500: #787FA8;

/* Warning & Danger (Threshold Alerts) */
--amber-50: #FEF9EE;  --amber-200: #FBE2AF;  --amber-500: #BA7C1B; (WARNING >= 80%)
--rose-50: #FCF4F3;   --rose-200: #F1C3BF;   --rose-500: #B74E49;  (EXCEEDED > 100%)

/* Surfaces & Text */
--bg-page: #F9FAF8;       --bg-card: #FFFFFF;        --bg-card-subtle: #F4F6F4;
--border-light: #E7ECE8;  --border-subtle: #DEE4DF;  --border-strong: #B0BEB3;
--text-main: #1C2520;     --text-muted: #58655F;     --text-faint: #8A9891;
```

### 6.2 Predefined Utility Classes
- **Buttons:** `.btn`, `.btn-primary` (sage gradient), `.btn-secondary` (subtle border), `.btn-danger` (soft rose), `.btn-sm`.
- **Containers:** `.container` (max-width: 1240px, centered), `.card` (white surface with soft shadow), `.glass-panel` (backdrop blur).
- **Badges:** `.badge`, `.badge-sage`, `.badge-amber`, `.badge-rose`, `.badge-slate`, `.badge-lavender`.
- **Forms:** `.form-group`, `.form-label`, `.form-input` (handles focus ring in sage).
- **Animations:** `.pulse-warning`, `.fadeIn`.

---

## 7. Core Application Workflows

### 7.1 Authentication & Route Guarding
1. `AuthProvider` in `src/context/AuthContext.js` loads `cc_token` and `cc_user` from `localStorage` on initial mount.
2. Calls `api.getMe()` to validate token freshness.
3. If unauthenticated and on a protected route (`/`, `/history`, `/limits`, `/account`), automatically redirects to `/login`.
4. If token is invalid or expired, clears `localStorage` and routes to `/login`.

### 7.2 Expense Recording Flow
Expenses can be recorded via two methods inside `AddTransactionModal.js`:
- **Manual Tab:** User inputs amount, merchant name, category (from predefined 11 categories), transaction date, and optional notes.
- **SMS Parser Tab:** User pastes standard bank notification text (or selects from pre-populated samples: HDFC, ICICI, Axis). The frontend sends `{ smsText }` to `api.parseSMS()`. The backend extracts amount, merchant, card last 4, and infers category. The user reviews and clicks "Confirm & Save".
- On success, the modal calls `onSuccess(warningAlert)`, triggering a dashboard refresh and displaying a top warning banner if the new spend breached the threshold.

### 7.3 Spending Limit & Threshold Calculation
- If `totalSpent >= personalLimit`: Status is `EXCEEDED` (Rose alert banner, pulsating icon).
- Else if `(totalSpent / personalLimit) * 100 >= alertThreshold`: Status is `WARNING` (Amber alert banner).
- Else: Status is `SAFE`.

### 7.4 Historical Trend Charting (`src/app/history/page.js`)
- Does not use heavy charting libraries (like Chart.js or Recharts).
- Uses a lightweight, performant **native SVG bar chart**:
  - Dynamically calculates bar height, y-axis grid lines, and interactive tooltips.
  - Draws a dotted reference line for the user's `personalLimit` across all months.
  - Highlights whether a month exceeded budget (soft red bar) or stayed safe (pastel green bar).

---

## 8. Common Engineering Patterns & Guidelines

### 8.1 Adding a New Page or Route
1. Create folder in `src/app/<route-name>/page.js`.
2. Must include `'use client';` if it uses hooks, context, or browser APIs.
3. Use `<PageHeader title="..." subtitle="..." />` for visual consistency.
4. If it's a primary navigation destination, register it in `src/components/Navbar.js` under `navLinks`.

### 8.2 Adding a New API Endpoint
1. Add the method to the `api` object in `src/lib/api.js`.
2. Follow existing pattern: return the result of `request(endpoint, options)`.

### 8.3 Important Conventions & Gotchas
- **Next.js 16 App Router:** Client components must begin with `'use client';`.
- **Window & LocalStorage:** Always verify `typeof window !== 'undefined'` before accessing `localStorage` or `window`.
- **Form Controls:** Use `CustomDropdown.js` for dropdown selects rather than native unstyled HTML `<select>` elements to maintain design consistency.
- **Dates:** Dates are formatted as `YYYY-MM-DD`. When displaying dates to users, format them cleanly (e.g., `02 Oct 2026`).
- **Currency Symbols:** Never hardcode `₹`. Always reference `currencySymbol` from `overview?.currencySymbol || user?.currencySymbol || '₹'`.
- **Tailwind Prohibition:** Do not introduce `@tailwind`, utility classes like `p-4`, `flex-col`, or Tailwind dependencies. Keep all styles within `globals.css` or styled inline objects adhering to the CSS token system.
