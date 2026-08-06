---
name: Firebase intention pattern
description: How future-self intentions are stored — fields on UserProfile, not a separate collection
---

Intentions live on `users/{uid}/profile/main` as three fields:
- `currentIntention` — the text
- `intentionSetAt` — ISO date string (YYYY-MM-DD)
- `intentionSurfacedAt` — ISO date string, absent until surfaced

**Why:** Avoids a separate collection read; profile is already fetched on Home mount. Keeps the data model flat.

**How to apply:** When saving a new intention, use `deleteField()` to clear `intentionSurfacedAt` (not null — Firestore null requires extra index considerations and the field simply shouldn't exist until surfaced). When surfacing, write today's ISO date to `intentionSurfacedAt`. Trigger surface UI when `daysSince >= 90 && !intentionSurfacedAt`.
