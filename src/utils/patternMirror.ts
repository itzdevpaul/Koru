// Pattern mirror — soft, descriptive observations from recent check-in reflections.
// Never diagnostic. Only surfaces patterns the user has already expressed.
// Uses up to 14 check-ins and detects temporal trends (increasing / decreasing).

import type { CheckIn } from '../firebase'

export interface PatternObservation {
  id: string
  message: string
  type: 'challenging' | 'positive'
}

interface PatternDef {
  id: string
  label: string
  type: 'challenging' | 'positive'
  keywords: string[]
  messageFn: (count: number, total: number) => string
  increasingFn: (count: number, total: number) => string
  shiftingFn: () => string   // was appearing, now easing
}

const PATTERNS: PatternDef[] = [
  {
    id: 'unheard',
    label: 'feeling unheard',
    type: 'challenging',
    keywords: ['unheard', 'ignored', 'dismissed', 'not listen', "don't listen", 'nobody listens',
               'no one listens', 'not heard', 'talk over', 'talking over'],
    messageFn: (n, t) => `You've mentioned feeling unheard in ${n} of your last ${t} entries. That might be worth sitting with.`,
    increasingFn: (n, t) => `Feeling unheard has come up in ${n} of your last ${t} entries — and more frequently lately. Something worth addressing.`,
    shiftingFn: () => `You used to write about feeling unheard more often. Something seems to be shifting there.`,
  },
  {
    id: 'drained',
    label: 'feeling drained',
    type: 'challenging',
    keywords: ['drained', 'exhausted', 'tired', 'burnt out', 'burnout', 'burn out',
               'depleted', 'no energy', 'worn out', 'running on empty', 'empty'],
    messageFn: (n, t) => `Feelings of exhaustion have shown up in ${n} of your last ${t} entries. Your body might be asking for something.`,
    increasingFn: (n, t) => `Exhaustion has come up ${n} times across your last ${t} entries — it's been getting louder recently. Worth listening to.`,
    shiftingFn: () => `You've been writing about feeling drained less than before. That's a real change — worth noticing.`,
  },
  {
    id: 'stuck',
    label: 'feeling stuck',
    type: 'challenging',
    keywords: ['stuck', 'stagnant', 'going nowhere', 'no progress', 'same place',
               'spinning', 'not moving', 'standstill', 'in a rut'],
    messageFn: (n, t) => `You've written about feeling stuck ${n} times in your last ${t} entries. Movement doesn't always look like progress.`,
    increasingFn: (n, t) => `Feeling stuck has shown up ${n} times recently — more than before. Sometimes that's the moment just before something shifts.`,
    shiftingFn: () => `Feeling stuck used to come up a lot in your entries. It seems to be easing.`,
  },
  {
    id: 'overwhelmed',
    label: 'feeling overwhelmed',
    type: 'challenging',
    keywords: ['overwhelmed', 'too much', "can't handle", 'drowning', 'overloaded',
               'falling behind', 'too many', 'buried', 'swamped'],
    messageFn: (n, t) => `Overwhelm has come up in ${n} of your last ${t} entries. Some things might need to be let go, not figured out.`,
    increasingFn: (n, t) => `Overwhelm has appeared in ${n} of your last ${t} reflections, more so lately. It might be time to put something down.`,
    shiftingFn: () => `You've been mentioning overwhelm less than you used to. That's meaningful — something may have settled.`,
  },
  {
    id: 'lonely',
    label: 'feeling alone',
    type: 'challenging',
    keywords: ['lonely', 'alone', 'isolated', 'disconnected', 'no one around',
               'by myself', 'no friends', 'no one to talk', 'on my own'],
    messageFn: (n, t) => `A sense of isolation has appeared in ${n} of your last ${t} entries. That's real and worth noticing.`,
    increasingFn: (n, t) => `Loneliness has come up ${n} times in your last ${t} reflections — and more recently. You don't have to sit with that alone.`,
    shiftingFn: () => `You used to write about feeling alone more often. It seems like that's been changing.`,
  },
  {
    id: 'anxious',
    label: 'feeling anxious',
    type: 'challenging',
    keywords: ['anxious', 'anxiety', 'worried', 'nervous', 'scared', 'afraid',
               'fear', 'dreading', 'dread', 'on edge', 'uneasy'],
    messageFn: (n, t) => `Worry or anxiety has shown up ${n} times in your last ${t} reflections. You're not alone in that.`,
    increasingFn: (n, t) => `Anxiety has been showing up more in your recent entries — ${n} of your last ${t}. That deserves some care.`,
    shiftingFn: () => `You've been writing about anxiety or worry less than before. Something may be settling.`,
  },
  {
    id: 'grateful',
    label: 'feeling grateful',
    type: 'positive',
    keywords: ['grateful', 'thankful', 'blessed', 'appreciate', 'appreciation',
               'fortunate', 'lucky', 'glad', 'grateful for'],
    messageFn: (n, t) => `You've written about gratitude in ${n} of your last ${t} entries. That's a real shift — and it compounds.`,
    increasingFn: (n, t) => `Gratitude has shown up in ${n} of your last ${t} entries, and more in your recent ones. Something is shifting.`,
    shiftingFn: () => `Gratitude used to show up more in your reflections. It might be worth returning to.`,
  },
  {
    id: 'excited',
    label: 'feeling excited',
    type: 'positive',
    keywords: ['excited', 'looking forward', "can't wait", 'thrilled', 'energised',
               'energized', 'motivated', 'inspired', 'fired up', 'pumped', 'hopeful'],
    messageFn: (n, t) => `Energy and excitement have come through in ${n} of your last ${t} entries. Something's alive here.`,
    increasingFn: (n, t) => `Excitement and motivation have been showing up more in your recent entries — ${n} of the last ${t}. That's momentum.`,
    shiftingFn: () => `You used to write about excitement more often. Something worth checking in on.`,
  },
]

function matchCount(entries: Array<CheckIn & { date: string }>, def: PatternDef): number {
  return entries.filter(c => {
    const text = c.reflection.toLowerCase()
    return def.keywords.some(kw => text.includes(kw))
  }).length
}

export function analyzePatterns(
  checkIns: Array<CheckIn & { date: string }>,
): PatternObservation[] {
  // Only entries with meaningful reflections
  // checkIns arrive newest-first (from getRecentCheckIns with orderBy desc)
  const withReflection = checkIns.filter(c => c.reflection && c.reflection.trim().length >= 15)
  const total = withReflection.length
  if (total < 3) return []

  // Split into recent (first half) and older (second half)
  // newest-first means index 0 = most recent, higher index = older
  const splitIdx = Math.ceil(total / 2)
  const recent = withReflection.slice(0, splitIdx)  // newer entries
  const older  = withReflection.slice(splitIdx)     // older entries

  // Global threshold: at least 2 matches, or 35% of entries
  const threshold = Math.max(2, Math.floor(total * 0.35))

  const challenging: PatternObservation[] = []
  const positive: PatternObservation[] = []

  for (const def of PATTERNS) {
    const allMatches  = matchCount(withReflection, def)
    if (allMatches < threshold) continue

    const recentMatches = matchCount(recent, def)
    const olderMatches  = matchCount(older, def)

    // Trend: compare rates in each half
    const recentRate = recent.length > 0 ? recentMatches / recent.length : 0
    const olderRate  = older.length  > 0 ? olderMatches  / older.length  : 0

    // "Shifting" = appeared frequently in older half, barely in recent
    const isShifting  = older.length >= 2 && olderRate >= 0.45 && recentRate < olderRate * 0.55
    // "Increasing" = significantly more frequent in recent half
    const isIncreasing = recent.length >= 2 && recentRate >= olderRate * 1.45 && recentMatches >= 2

    let message: string
    let type: PatternObservation['type']

    if (def.type === 'challenging' && isShifting) {
      // Was a problem, now easing — surface as positive insight
      message = def.shiftingFn()
      type = 'positive'
    } else if (isIncreasing) {
      message = def.increasingFn(allMatches, total)
      type = def.type
    } else {
      message = def.messageFn(allMatches, total)
      type = def.type
    }

    const obs: PatternObservation = { id: def.id, message, type }
    if (type === 'positive') positive.push(obs)
    else challenging.push(obs)
  }

  // Return at most 1 challenging + 1 positive, challenging first
  const result: PatternObservation[] = []
  if (challenging.length > 0) result.push(challenging[0])
  if (positive.length > 0) result.push(positive[0])
  return result
}

// ── Seen-pattern persistence (localStorage, resets daily) ────────────────────

function seenKey(): string {
  const today = new Date().toISOString().slice(0, 10)
  return `koru-patterns-${today}`
}

export function getSeenPatternIds(): string[] {
  try { return JSON.parse(localStorage.getItem(seenKey()) ?? '[]') as string[] }
  catch { return [] }
}

export function markPatternsSeen(ids: string[]): void {
  const existing = getSeenPatternIds()
  localStorage.setItem(seenKey(), JSON.stringify([...new Set([...existing, ...ids])]))
}
