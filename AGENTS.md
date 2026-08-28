# Koru — dev environment notes

Run with: `docker compose -f docker-compose.base44.yml up -d` (preview on host port 3000).

- One container runs both processes via `pnpm run dev`: Vite (5000 → host 3000) and the Express API (`server/index.ts`, port 3001). Vite proxies `/api` to `localhost:3001`, so both must live in the same container.
- Use **pnpm** (repo has `pnpm-lock.yaml`). `npm install` inside the bind-mounted volume crashes with "Exit handler never called!".
- Non-secret client config (public Firebase web config, Squad public key, `APP_URL`) lives in `.env.base44-defaults`; real secrets come from `/run/base44/app.env` (loaded last, so it wins). `ADMIN_PASSWORD` has a placeholder in defaults — set the real value via secrets.
- API secrets are lazy: the server boots without `FIREBASE_SERVICE_ACCOUNT`, `RESEND_API_KEY`, `SQUAD_SECRET_KEY`; only the routes using them fail.
- `vite.config.ts` bridges `VITE_*` from `process.env` into `import.meta.env`, so those vars must be in the service env, not only in a `.env` file.
- Two source files were missing from the import and were added: `src/utils/sanitize.ts` and `src/components/KoruLoader.tsx`.
- Health check: `curl localhost:3001/api/health` → `{"status":"ok"}`.

## Monetization model (teaser hook + one-time unlock)

- **All quizzes are free to take.** No hard paywall, no padlock, no rate limit. Users answer questions and get a free teaser result (emoji + title + tagline + 2-sentence preview).
- **Deep reports are gated.** The full description, traits, deep-dive analysis, and action plan are locked behind Pro or a one-time unlock. Content lives in `src/data/deepReports.ts` (keyed by `${quizId}/${resultTypeId}`).
- **Two purchase options:**
  - One-time unlock: ₦1,000 per report (via `/api/unlock/initiate` + `/api/unlock/activate`). Stored in Firestore at `users/{uid}/unlocks/{quizId}`.
  - Subscription: ₦2,500/month, with ₦1,000 first-month intro for new subscribers. Intro pricing is automatic — checked via `users/{uid}/subscription/main` existence.
- **Pricing endpoint:** `POST /api/subscribe/price` returns `baseAmount`, `finalAmount`, `discountPercent`, `discountReason`, `unlockAmount`.
- **SubscriptionContext** tracks both `isPro` (subscription active) and `unlockedQuizIds` (one-time purchases). Use `hasReportAccess(quizId)` to check if a user can see a deep report.
- **Upgrade prompts at moments of joy:**
  - Streak trigger: `StreakUpgradePrompt` component shows at 3-day check-in streak (Home page, free users only, once per session).
  - Completion trigger: the Quiz result page paywall shows a preview snippet + what's in the deep report, with one-time unlock and Pro CTAs.
- **30-Day Clarity Delta** (`/clarity-card`) is Pro-gated. Non-Pro users see a paywall.
- **PaymentReturn** handles both payment types: checks `sessionStorage.getItem('koru-payment-type')` — `'unlock'` routes to `/api/unlock/activate`, otherwise subscription flow.

## PWA icons

- All PWA icons (`apple-touch-icon.png` 1024×1024, `pwa-192.png` 192×192, `pwa-512.png` 512×512) are generated from `public/favicon.svg`, which matches the `KoruLogo` Pathfinder K brand mark.
- `manifest.webmanifest` declares all three sizes with proper `purpose` (`any` for 192/512, `maskable` for 1024).
- To regenerate: `convert -density 384 -background none public/favicon.svg -resize 1024x1024 public/apple-touch-icon.png` (and 192/512 variants).

## Security audit (2026-08-28)

- **Auth**: All sensitive endpoints verify Firebase ID tokens via `getAuthenticatedUser()`; admin routes additionally check `decoded.email === ADMIN_EMAIL`. IDOR prevented by verifying `uid === decoded.uid`.
- **CORS**: `Access-Control-Allow-Origin: *` — acceptable because all sensitive routes require Bearer token auth.
- **Input sanitization**: `src/utils/sanitize.ts` provides `sanitizeText`, `sanitizeEmail`, `sanitizeDisplayName`, `sanitizeInviteCode`, `sanitizeHttpUrl` — used across all write paths.
- **Firestore rules**: Owner-based access, admin check via verified email, deny-all default. Solid.
- **Admin password**: Was hardcoded as `koru-admin-2026` in `.env.base44-defaults` (committed to git). Replaced with placeholder `change-me-via-secrets` — set the real value via the secrets dashboard.
- **No rate limiting**: Not implemented. Low risk since Firebase Auth is the primary gate, but `/api/admin/login` could be brute-forced. Consider adding rate limiting in production.
- **Origin validation**: `subscribe/initiate` allows `koru.com.ng` and `*.replit.dev` origins for callback URLs; falls back to `APP_URL` for unknown origins.
