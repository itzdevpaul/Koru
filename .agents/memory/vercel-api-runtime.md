---
name: Vercel API runtime boundary
description: Production Vercel functions and Replit development secrets are separate runtime environments.
---

Vercel deployments do not inherit Replit Secrets or environment variables. A serverless API that works in the Replit workflow can still fail in Vercel until the Vercel project has the same variable names and a fresh deployment.

**Why:** The published Koru site returned Vercel `FUNCTION_INVOCATION_FAILED` while the same Express app served normally in Replit, and the deployment used an external Vercel project.

**How to apply:** For external Vercel deployments, configure credentials and production flags in Vercel, redeploy, and test the function URL separately from the Replit preview.