// Pattern mirror — soft, descriptive observations from recent check-in reflections.
// Never diagnostic. Only surfaces patterns the user has already expressed.

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
}

const PATTERNS: PatternDef[] = [
  {
    id: 'unheard',
    label: 'feeling unheard',
    type: 'challenging',
    keywords: ['unheard', 'ignored', 'dismissed', 'not listen', "don't listen", 'nobody listens',
               'no one listens', 'not heard', 'talk over', 'talking over'],
    messageFn: (n, t) => `You've mentioned feeling unheard in ${n} of your last ${t} entries. That might be worth sitting with.`,
  },
  {
    id: 'drained',
    label: 'feeling drained',
    type: 'challenging',
    keywords: ['drained', 'exhausted', 'tired', 'burnt out', 'burnout', 'burn out',
               'depleted', 'no energy', 'worn out', 'running on empty', 'empty'],
    messageFn: (n, t) => `Feelings of exhaustion have shown up in ${n} of your last ${t} entries. Your body might be asking for something.`,
  },
  {
    id: 'stuck',
    label: 'feeling stuck',
    type: 'challenging',
    keywords: ['stuck', 'stagnant', 'going nowhere', 'no progress', 'same place',
               'spinning', 'not moving', 'standstill', 'in a rut'],
    messageFn: (n, t) => `You've written about feeling stuck ${n} times in your last ${t} entries. Movement doesn't always look like progress.`,
  },
  {
    id: 'overwhelmed',
    label: 'feeling overwhelmed',
    type: 'challenging',
    keywords: ['overwhelmed', 'too much', "can't handle", 'drowning', 'overloaded',
               'falling behind', 'too many', 'buried', 'swamped'],
    messageFn: (n, t) => `Overwhelm has come up in ${n} of your last ${t} entries. Some things might need to be let go, not figured out.`,
  },
  {
    id: 'lonely',
    label: 'feeling alone',
    type: 'challenging',
    keywords: ['lonely', 'alone', 'isolated', 'disconnected', 'no one around',
               'by myself', 'no friends', 'no one to talk', 'on my own'],
    messageFn: (n, t) => `A sense of isolation has appeared in ${n} of your last ${t} entries. That's real and worth noticing.`,
  },
  {
    id: 'anxious',
    label: 'feeling anxious',
    type: 'challenging',
    keywords: ['anxious', 'anxiety', 'worried', 'nervous', 'scared', 'afraid',
               'fear', 'dreading', 'dread', 'on edge', 'uneasy'],
    messageFn: (n, t) => `Worry or anxiety has shown up ${n} times in your last ${t} reflections. You're not alone in that.`,
  },
  {
    id: 'grateful',
    label: 'feeling grateful',
    type: 'positive',
    keywords: ['grateful', 'thankful', 'blessed', 'appreciate', 'appreciation',
               'fortunate', 'lucky', 'glad', 'grateful for'],
    messageFn: (n, t) => `You've written about gratitude in ${n} of your last ${t} entries. That's a real shift — and it compounds.`,
  },
  {
    id: 'excited',
    label: 'feeling excited',
    type: 'positive',
    keywords: ['excited', 'looking forward', "can't wait", 'thrilled', 'energised',
               'energized', 'motivated', 'inspired', 'fired up', 'pumped', 'hopeful'],
    messageFn: (n, t) => `Energy and excitement have come through in ${n} of your last ${t} entries. Something's alive here.`,
  },
]

export function analyzePatterns(
  checkIns: Array<CheckIn & { date: string }>,
): PatternObservation[] {
  // Only use entries with meaningful reflections
  const withReflection = checkIns.filter(c => c.reflection && c.reflection.trim().length >= 15)
  const total = withReflection.length
  if (total < 3) return []

  // Threshold: appears in at least 3 entries, or ≥50% if total > 5
  const threshold = Math.max(3, Math.floor(total * 0.5))

  const challenging: PatternObservation[] = []
  const positive: PatternObservation[] = []

  for (const def of PATTERNS) {
    const matches = withReflection.filter(c => {
      const text = c.reflection.toLowerCase()
      return def.keywords.some(kw => text.includes(kw))
    })
    if (matches.length >= threshold) {
      const obs: PatternObservation = {
        id: def.id,
        type: def.type,
        message: def.messageFn(matches.length, total),
      }
      if (def.type === 'challenging') challenging.push(obs)
      else positive.push(obs)
    }
  }

  // Return at most 1 challenging + 1 positive, challenging first
  const result: PatternObservation[] = []
  if (challenging.length > 0) result.push(challenging[0])
  if (positive.length > 0) result.push(positive[0])
  return result
}
