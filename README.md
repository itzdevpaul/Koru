# Koru

Koru is a reflective wellness app for clarity, self-knowledge, daily check-ins, quizzes, and guided reports.

## Stack

- React 19 + TypeScript
- Vite 6
- Express 5 API
- Firebase Authentication, Firestore, and Firebase Admin SDK
- Squad for subscription and one-time report payments
- Resend for transactional email
- Tailwind CSS 4

## Local development

Use pnpm. The development command runs both the Vite client and Express API:

```bash
pnpm install
pnpm run dev
```

The browser client runs on port `5000`; the API runs on port `3001`. Vite proxies `/api` requests to the API server.

## Environment variables

Public Firebase web configuration belongs in the client environment using the existing `VITE_*` variables. Server-only values must never be exposed to browser code:

- `FIREBASE_SERVICE_ACCOUNT` — Firebase Admin service-account JSON or base64-encoded JSON
- `SQUAD_SECRET_KEY` — Squad server secret
- `SQUAD_ENV` — `sandbox` for testing; omit or use another value for production
- `RESEND_API_KEY` — required only for email routes
- `ADMIN_EMAIL` — email allowed to use admin routes
- `ADMIN_PASSWORD` — required only for the legacy admin login route

## Application areas

- `src/pages/Home.tsx` — dashboard, check-ins, streaks, prompts, and retention flows
- `src/pages/Quiz.tsx` — quiz answering and teaser/deep-report access
- `src/data/quizzes.ts` — quiz definitions and scoring
- `src/data/deepReports.ts` — gated deep-report content
- `src/firebase.ts` — browser Firebase helpers and API client functions
- `src/components/` — reusable UI and application flows
- `server/index.ts` — Express API routes and security middleware
- `api/_lib/admin.ts` — lazy Firebase Admin initialization
- `api/_lib/squad.ts` — isolated Squad configuration and payment helpers
- `firestore.rules` — client Firestore access rules
- `vercel.json` — Vercel rewrites, cache policy, and security headers

## Payments

All prices and payment amounts are calculated server-side. Subscription initiation uses Squad; the browser only receives a hosted checkout URL. Never put `SQUAD_SECRET_KEY` in client code. Payment callbacks must be verified server-side before activating a subscription or report unlock.

## Firestore security

Client access is owner-scoped by Firebase UID. Subscription records, report unlocks, promo codes, and administrative data are server-managed through Firebase Admin and are not writable from the browser. Deploy `firestore.rules` through the Firebase Console or Firebase CLI when rules change.

## Security checks

The API disables Express version headers, restricts CORS to trusted origins, emits a request ID, and sends baseline security headers. Run the normal checks before shipping:

```bash
pnpm exec tsc --noEmit
pnpm run build
git diff --check
```

The production health endpoint is `/api/health`. The secret-safe configuration endpoint is `/api/diagnostics`; it reports only whether Firebase and Squad are configured and which Squad environment is selected.

## Compliance notes

Automated Vulnify scans are preliminary indicators, not certifications or a substitute for qualified GDPR, PCI DSS, ISO 27001, or SOC 2 audits. The supplied September 2026 reports identified CSP, CORS, version-header, and privacy-transparency improvements; the project addresses the applicable web-configuration findings, but organizational compliance still requires documented processes, risk assessment, access reviews, retention policies, incident response, and independent assessment.

## Deployment

Vercel uses `pnpm build` and serves the generated `dist` directory. Confirm production environment variables are configured for the Production environment before deploying. Deployments from feature branches should be reviewed before merging into `main`.

## License

Private project. All rights reserved.
