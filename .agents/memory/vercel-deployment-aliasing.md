---
name: Vercel deployment aliasing
description: A successful GitHub-triggered Vercel deployment may not be the deployment serving the custom domain.
---

A successful Vercel deployment check does not guarantee that the custom production domain has been promoted to that deployment.

**Why:** During production debugging, GitHub reported a successful deployment while the custom domain continued serving an older function version.

**How to apply:** When live behavior does not match a pushed commit, compare the live response fingerprint with the deployment linked by the GitHub check and promote the successful deployment or correct Vercel’s production branch/alias before changing application code again.