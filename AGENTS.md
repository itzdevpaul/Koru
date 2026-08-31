# Koru — dev environment notes

Run with: `docker compose -f docker-compose.base44.yml up -d` (preview on host port 3000).

- One container runs both processes via `pnpm run dev`: Vite (5000 → host 3000) and the Express API (`server/index.ts`, port 3001). Vite proxies `/api` to `localhost:3001`, so both must live in the same container.
- Use **pnpm** (repo has `pnpm-lock.yaml`). `npm install` inside the bind-mounted volume crashes with "Exit handler never called!".
- Non-secret client config (public Firebase web config, Squad public key, `APP_URL`) lives in `.env.base44-defaults`; real secrets come from `/run/base44/app.env` (loaded last, so it wins). `ADMIN_PASSWORD` has a placeholder in defaults — set the real value via secrets.
- API secrets are lazy: the server boots without `FIREBASE_SERVICE_ACCOUNT`, `RESEND_API_KEY`, `SQUAD_SECRET_KEY`; only the routes using them fail.
- `vite.config.ts` bridges `VITE_*` from `process.env` into `import.meta.env`, so those vars must be in the service env, not only in a `.env` file.
- Two source files were missing from the import and were added: `src/utils/sanitize.ts` and `src/components/KoruLoader.tsx`.
- `src/firebase.ts` had a stray trailing `}` (after `withTimeout`) that broke esbuild's dependency scan; removed it.
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

## Growth, retention, security & analytics (2026-08-29)

### Growth & Social Proof
- **Aesthetic Shareables**: Already existed — quiz results, daily check-ins, clarity delta, and future self cards can all be exported as 1080×1080 (or 1080×1350) PNG images via canvas rendering (`src/utils/shareImage.ts`). The Quiz page and Home page both have "Share" buttons that generate and download/share these images.
- **"Give a Month" Referral**: Threshold changed from 10 to **100 referrals** for the 7-day Pro reward. Existing users without invite codes can be backfilled via the admin endpoint `POST /api/admin/backfill-codes` (admin-only). The Profile page shows a progress bar (not individual dots) for the 100-referral goal.

### Retention
- **Contextual Push Notifications**: The daily push scheduler (`maybeSendDailyPush` in `server/index.ts`) now sends **personalized, time-aware** notifications. Each recipient gets a message tailored to their name, time of day (morning/afternoon/evening), and whether they've already checked in today. Uses `sendEach` (per-device messages) instead of `sendEachForMulticast` (single message for all).
- **Weekly Wrap-Up Email**: New endpoint `POST /api/send-weekly-wrapup` fetches the user's check-ins for the past 7 days, computes streak/avg mood/avg energy, and sends an HTML email with a stats grid and a **blurred teaser section** for Pro trend reports. Triggered automatically on Sundays via the Home page's weekly email useEffect (replaces the regular reminder on Sundays). Client function: `sendWeeklyWrapUp()` in `src/firebase.ts`.

### Security
- **Data Decoupling + Encryption at Rest**: Sensitive free-text fields (check-in reflections, future-self intentions) are now **client-side encrypted** using AES-GCM via the Web Crypto API (`src/utils/crypto.ts`). The encryption key is derived from the user's UID + an app salt via PBKDF2 (150K iterations). Encrypted data is stored as `{ reflectionEnc: { c, i } }` (base64 ciphertext + IV) instead of plaintext `reflection`. Backward-compatible: old plaintext entries are still readable; new writes use encryption. The `getUserProfile` and check-in read functions automatically decrypt.
- **Auto-logout on Inactivity**: `src/components/IdleTimer.tsx` signs users out after **15 minutes** of no interaction (mouse, keyboard, touch, scroll). Shows a warning toast at 14 minutes. Only active for authenticated users. Mounted globally in `main.tsx`.
- **Input Sanitization**: Already existed (`src/utils/sanitize.ts`) — all free-text inputs are sanitized with `sanitizeText`, `sanitizeDisplayName`, `sanitizeEmail`, etc. Verified to be used across all write paths.

### Funnel Analytics
- **Drop-off Tracking**: `src/utils/funnelEvents.ts` logs upgrade-page events to a Firestore `funnelEvents` collection. Tracked events: `upgrade_page_view`, `upgrade_scroll_50`, `upgrade_scroll_100`, `upgrade_price_seen`, `upgrade_cta_click`, `upgrade_bounce`. The bounce event uses `navigator.sendBeacon` to a server endpoint (`POST /api/funnel-event`) for reliability on page unload. The Upgrade page (`src/pages/Upgrade.tsx`) integrates all tracking hooks.

## Security audit (2026-08-28)

- **Auth**: All sensitive endpoints verify Firebase ID tokens via `getAuthenticatedUser()`; admin routes additionally check `decoded.email === ADMIN_EMAIL`. IDOR prevented by verifying `uid === decoded.uid`.
- **CORS**: `Access-Control-Allow-Origin: *` — acceptable because all sensitive routes require Bearer token auth.
- **Input sanitization**: `src/utils/sanitize.ts` provides `sanitizeText`, `sanitizeEmail`, `sanitizeDisplayName`, `sanitizeInviteCode`, `sanitizeHttpUrl` — used across all write paths.
- **Firestore rules**: Owner-based access, admin check via verified email, deny-all default. Solid.
- **Admin password**: Was hardcoded as `koru-admin-2026` in `.env.base44-defaults` (committed to git). Replaced with placeholder `change-me-via-secrets` — set the real value via the secrets dashboard.
- **No rate limiting**: Not implemented. Low risk since Firebase Auth is the primary gate, but `/api/admin/login` could be brute-forced. Consider adding rate limiting in production.
- **Origin validation**: `subscribe/initiate` allows `koru.com.ng` and `*.replit.dev` origins for callback URLs; falls back to `APP_URL` for unknown origins.
