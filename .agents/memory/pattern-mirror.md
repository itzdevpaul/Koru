---
name: Pattern mirror analysis
description: How the pattern mirror surfaces recurring themes from check-in reflections
---

Logic lives in `src/utils/patternMirror.ts`. Analysis is entirely client-side — no extra Firestore reads beyond the `getRecentCheckIns(uid, 5)` call added to the Home mount effect.

**Why:** Avoids server cost; 5 docs is well within Firestore free tier. Descriptive observations only — never diagnostic.

**Threshold rule:** A pattern triggers when it appears in `max(3, ⌊total × 0.5⌋)` entries with reflections ≥15 chars. This prevents false positives from sparse data.

**Output:** At most 1 challenging + 1 positive observation. PatternMirrorCard renders them, is self-dismissing (component state, not persisted).
