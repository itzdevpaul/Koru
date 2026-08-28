# Koru — dev environment notes

Run with: `docker compose -f docker-compose.base44.yml up -d` (preview on host port 3000).

- One container runs both processes via `pnpm run dev`: Vite (5000 → host 3000) and the Express API (`server/index.ts`, port 3001). Vite proxies `/api` to `localhost:3001`, so both must live in the same container.
- Use **pnpm** (repo has `pnpm-lock.yaml`). `npm install` inside the bind-mounted volume crashes with "Exit handler never called!".
- Non-secret client config (public Firebase web config, Squad public key, `APP_URL`, `ADMIN_PASSWORD`) lives in `.env.base44-defaults`; real secrets come from `/run/base44/app.env` (loaded last, so it wins).
- API secrets are lazy: the server boots without `FIREBASE_SERVICE_ACCOUNT`, `RESEND_API_KEY`, `SQUAD_SECRET_KEY`; only the routes using them fail.
- `vite.config.ts` bridges `VITE_*` from `process.env` into `import.meta.env`, so those vars must be in the service env, not only in a `.env` file.
- Two source files were missing from the import and were added: `src/utils/sanitize.ts` and `src/components/KoruLoader.tsx`.
- Health check: `curl localhost:3001/api/health` → `{"status":"ok"}`.
