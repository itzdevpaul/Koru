# Koru – Self-Discovery App

**Domain:** koru.com.ng  
**Stack:** React 19 + TypeScript + Vite 6 + Tailwind CSS v4 + Firebase (Auth + Firestore)  
**Description:** Digital self-discovery and personal development platform. Users sign up, sign in, and access a home dashboard. Onboarding and quizzes are coming next.

## Architecture

- `src/main.tsx` — App entry point, routing, wraps everything in `AuthProvider`
- `src/context/AuthContext.tsx` — Firebase Auth state via React context (`useAuth` hook)
- `src/components/ProtectedRoute.tsx` — Redirects unauthenticated users to `/signin`
- `src/firebase.ts` — Firebase init, Auth helpers (`signUp`, `signIn`, `signInWithGoogle`, `logOut`, `resetPassword`), Firestore helpers
- `src/pages/SignIn.tsx` — Email/password + Google sign-in
- `src/pages/SignUp.tsx` — Email/password + Google sign-up with password strength indicator
- `src/pages/ForgotPassword.tsx` — Password reset via email
- `src/pages/Home.tsx` — Authenticated home dashboard
- `src/pages/PrivacyPolicy.tsx` — Privacy policy
- `src/pages/TermsOfService.tsx` — Terms of service
- `src/index.css` — Tailwind v4 + custom animations + design tokens
- `vite.config.ts` — Vite config, port 5000, host 0.0.0.0, Firebase env var bridge
- `firestore.rules` — Firestore security rules (waitlist collection)

## Routes

| Path | Access | Page |
|------|--------|------|
| `/signin` | Public | Sign In |
| `/signup` | Public | Sign Up |
| `/forgot-password` | Public | Reset Password |
| `/home` | Protected | Home Dashboard |
| `/privacy-policy` | Public | Privacy Policy |
| `/terms-of-service` | Public | Terms of Service |
| `*` | — | Redirects to `/signin` |

## Running

```bash
npm install
npm run dev
```

## PWA

- `public/manifest.webmanifest` provides the installable app metadata and Koru branding.
- `public/sw.js` caches the app shell and serves `public/offline.html` when navigation is offline.
- The service worker registers automatically in production builds; local development remains network-first for a predictable Vite experience.
- Firebase web configuration is sufficient for installability. Push notifications would require a separate Firebase Cloud Messaging VAPID key if added later.

## Firebase

- **Auth:** Email/password + Google OAuth. Firebase project: `koru-official-a619b`.
- **Firestore:** `waitlist` collection (legacy, kept for reference). Auth is handled entirely client-side via Firebase Auth SDK.

## Environment Variables (set in Replit Secrets/Env)

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_ADMIN_PASSWORD` *(optional)*

## Design Tokens

- Background: `#FBF9F5` (cream)
- Primary: `#1B3B2B` (forest)
- Accent: `#A2BFA6` (sage)
- Highlight: `#E07A5F` (terracotta)
- Fonts: Plus Jakarta Sans (headings) + Inter (body)

## User Preferences

- Do not change existing design (colors, layout, typography).
- Domain is koru.com.ng — use it for all canonical/OG URLs.
- Firebase config is embedded via environment variables (not hardcoded).
- Build the actual product app — not the old waitlist landing page.
