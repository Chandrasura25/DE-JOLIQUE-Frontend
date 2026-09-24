# De-Jolique Enterprise — Storefront

The customer storefront and admin dashboard for the De-Jolique Enterprise online store. It's a single-page React app that talks **only** to the store's Express API (the `server/` repository). Sign-in, payments and all data go through that API, so this app holds no secrets.

| | |
| --- | --- |
| Framework | **React 19 + Vite** |
| Routing / data | React Router 7, TanStack Query, Axios |
| State | Zustand (auth profile, cart persisted in `localStorage`) |
| Styling | Tailwind CSS v4, Inter + Sora fonts, lucide icons |
| Hosting | **Vercel** (`vercel.json` included) |

---

## Features

**Storefront:** homepage (hero, categories, featured and latest products) · product listing with search, category and price filters, in-stock filter, sorting and pagination · product page with gallery, stock-aware quantity, Add to cart and Buy now · cart re-validated against live prices and stock · checkout with Paystack or Flutterwave · payment result page · responsive layout with skeletons, empty and error states, toasts and confirmation dialogs.

**Legal pages:** Privacy Policy (`/privacy`) and Terms of Service (`/terms`). Contact details come from the admin's store settings; the rest of the business details (CAC name, delivery areas and times, return and refund days) are in `src/pages/legal/legalConfig.js`.

**Customer accounts:** register, log in with email, **Google** or **Google One Tap**, log out from the top bar, forgot and reset password, profile editing, password change, order history, order detail with a progress tracker, retry payment, and cancel an unpaid order.

**Admin (`/admin`):** separate login with a forced password change on first login · dashboard (revenue, order counts, low stock, orders needing attention) · products with image upload · categories · orders with the fulfilment workflow, cancellation and refunds · **users**: every account with sign-in method and last login, and deletion of customer accounts (orders are kept) · **store settings**: the support email, phone and business address shown in the footer, Privacy Policy and Terms.

---

## Folder structure

```text
client/
├── public/                     # favicons and brand images (served as-is)
├── src/
│   ├── components/
│   │   ├── ui/                 # Button, Field, Dialog, Badge, Feedback, Pagination, …
│   │   ├── layout/             # Header (top bar + mobile drawer), Footer, StoreLayout, AuthShell, Logo
│   │   ├── auth/               # GoogleButton, GoogleOneTap
│   │   ├── account/, order/, product/, routing/
│   ├── lib/
│   │   ├── api.js              # axios instance (cookies, 401 handling, error messages)
│   │   ├── queries.js          # TanStack Query hooks
│   │   └── format.js           # prices, dates, "3 days ago"
│   ├── store/                  # authStore.js, cartStore.js (Zustand)
│   ├── pages/                  # storefront pages, auth/, account/, admin/
│   ├── App.jsx                 # routes (admin and account pages are lazy-loaded)
│   └── main.jsx
├── vercel.json                 # Vercel build, /api proxy and SPA rewrites
├── vite.config.js              # dev server + /api proxy to the local API
└── .env.example
```

---

## Getting started

Requirements: **Node.js 22+** and the API running locally (see the server README). By default it runs on `http://localhost:5000`.

```bash
npm install
cp .env.example .env        # optional: the defaults work for local development
npm run dev                 # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload; `/api` and `/uploads` are proxied to the API |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally (port 4173) |

### Environment variables

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | API base URL. **Leave empty** to call `/api` on the same origin, which is what the Vite dev proxy and the Vercel proxy both provide. Only set it (e.g. `https://api.example.com/api`) when the API is reached cross-origin without a proxy. |
| `VITE_DEV_API_PROXY` | Development only: where Vite forwards `/api` (default `http://localhost:5000`) |

Everything prefixed `VITE_` is compiled into the public JavaScript bundle. **Never put secrets here**: no Supabase keys, database URLs or payment secret keys. The app doesn't need any.

---

## How it talks to the API

- Every request goes to `/api/*` with `withCredentials`, so the browser sends the session cookies.
- **The app never sees an access or refresh token.** The API keeps the Supabase session in httpOnly cookies and refreshes it on its own. The auth store only holds the user's profile (`GET /api/auth/me`).
- **Google sign-in** is a full-page redirect to `/api/auth/google?next=<page>`. The API sends the user to Google through Supabase, then back to the page they started from. The button only appears when Google is enabled in Supabase (`GET /api/auth/providers`).
- **Google One Tap** appears for signed-out visitors on store pages (not in the admin area). Each prompt uses a fresh nonce from the API, and Google's ID token goes straight to `POST /api/auth/google/one-tap`, which turns it into the same cookie session. It shows up once `GOOGLE_CLIENT_ID` is set on the API and the storefront origin is listed under the Google client's *Authorised JavaScript origins*.
- **Email links** (confirmation, password reset) return through `/api/auth/callback`, which then redirects to `/login?auth=…` or `/reset-password`. The login page turns the `auth` value into a friendly message.
- **Admin pages are only a view.** Every admin request is checked by the API, which reads the role from the database each time.

---

## Deploying to Vercel

1. Create a Vercel project from this repository. The framework (Vite), build command, and output directory (`dist`) come from `vercel.json`.
2. **Edit `vercel.json`:** replace `YOUR-API-HOST` with the API project's Vercel domain, for example `jolique-api.vercel.app`:
   ```json
   { "source": "/api/:path*", "destination": "https://jolique-api.vercel.app/api/:path*" }
   ```
   This proxies every `/api` call through the storefront's own domain, so the session cookies are **first-party**. Safari and other browsers that block third-party cookies would otherwise break login when the API is on a different domain.
3. Leave `VITE_API_URL` **unset** in Vercel's environment variables.
4. On the API host, set `CLIENT_URL` and `SERVER_URL` to the storefront's URL (`https://<your-vercel-domain>`). In Supabase Auth, add `https://<your-vercel-domain>/api/auth/callback**` to the Redirect URLs. The server README's *Deployment* section has the full list.

`vercel.json` also sends every non-file path to `index.html`, so deep links and refreshes (`/account`, `/admin/users`) work, and it caches the hashed files in `/assets` for a year.

**Security headers** (also in `vercel.json`): a strict Content-Security-Policy (scripts only from this site and Google's One Tap script, no inline scripts, no framing), HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, a strict `Referrer-Policy` and a locked-down `Permissions-Policy`. If you add a third-party script (analytics, chat), add its origin to the CSP or the browser will block it.

The local `.vercel/` folder created by `vercel link` or the Vercel CLI is git-ignored. It only links your machine to the project and must not be committed.
