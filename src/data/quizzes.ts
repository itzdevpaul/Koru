export interface QuizOption {
  id: string
  text: string
  scores: Record<string, number>
}

export interface QuizQuestion {
  id: string
  text: string
  options: QuizOption[]
}

export interface QuizResultType {
  id: string
  title: string
  emoji: string
  tagline: string
  description: string
  traits: string[]
  color: string
  tagBg: string
}

export interface Quiz {
  id: string
  emoji: string
  title: string
  description: string
  category: string
  estimatedMinutes: number
  mature?: boolean
  questions: QuizQuestion[]
  results: QuizResultType[]
}

export const quizzes: Quiz[] = [
  // ── 1. Thinking Style ─────────────────────────────────────────────────────
  {
    id: 'thinking-style',
    emoji: '🧠',
    title: "What's your thinking style?",
    description: 'Discover how your mind works — and how to use it as a superpower.',
    category: 'Career & Hobbies',
    estimatedMinutes: 3,
    questions: [
      {
        id: 'q1',
        text: 'When you face a big decision, what do you do first?',
        options: [
          { id: 'a', text: 'Research and gather as much information as possible', scores: { analyst: 3 } },
          { id: 'b', text: 'Sit with it and tune into how it feels', scores: { connector: 3 } },
          { id: 'c', text: 'Brainstorm every wild possibility', scores: { visionary: 3 } },
          { id: 'd', text: 'Break it into smaller steps and make a plan', scores: { strategist: 3 } },
        ],
      },
      {
        id: 'q2',
        text: 'What excites you most when starting something new?',
        options: [
          { id: 'a', text: 'Understanding exactly how every part works', scores: { analyst: 3 } },
          { id: 'b', text: 'The people involved and what it means to them', scores: { connector: 3 } },
          { id: 'c', text: 'The freedom to experiment and try unexpected things', scores: { visionary: 3 } },
          { id: 'd', text: 'Having a clear path from start to finish', scores: { strategist: 3 } },
        ],
      },
      {
        id: 'q3',
        text: 'A friend needs advice on a tough situation. You lead with…',
        options: [
          { id: 'a', text: 'Facts, logical options, and likely outcomes', scores: { analyst: 3, strategist: 1 } },
          { id: 'b', text: 'Listening deeply before saying anything', scores: { connector: 3 } },
          { id: 'c', text: '"Have you considered this completely different angle?"', scores: { visionary: 3 } },
          { id: 'd', text: 'A concrete step-by-step action plan', scores: { strategist: 3, analyst: 1 } },
        ],
      },
      {
        id: 'q4',
        text: 'What do people typically come to you for?',
        options: [
          { id: 'a', text: 'Breaking down complex or confusing things', scores: { analyst: 3 } },
          { id: 'b', text: 'Real talk, support, and someone who actually listens', scores: { connector: 3 } },
          { id: 'c', text: 'Fresh ideas nobody else thought of', scores: { visionary: 3 } },
          { id: 'd', text: 'Actually getting things done', scores: { strategist: 3 } },
        ],
      },
      {
        id: 'q5',
        text: 'Your ideal Sunday afternoon looks like…',
        options: [
          { id: 'a', text: "Deep-diving into something you're curious about", scores: { analyst: 3, visionary: 1 } },
          { id: 'b', text: 'Meaningful time with someone you care about', scores: { connector: 3 } },
          { id: 'c', text: 'Creating, exploring, or trying something completely new', scores: { visionary: 3 } },
          { id: 'd', text: 'Ticking off a satisfying list and feeling productive', scores: { strategist: 3 } },
        ],
      },
      {
        id: 'q6',
        text: 'When something goes wrong on a project, your instinct is to…',
        options: [
          { id: 'a', text: 'Diagnose the root cause before doing anything else', scores: { analyst: 3 } },
          { id: 'b', text: 'Check in with everyone affected first', scores: { connector: 3 } },
          { id: 'c', text: 'Pivot fast and try an entirely different approach', scores: { visionary: 3 } },
          { id: 'd', text: 'Reassess the plan and adjust the timeline', scores: { strategist: 3 } },
        ],
      },
    ],
    results: [
      {
        id: 'analyst',
        title: 'The Analyst',
        emoji: '🔍',
        tagline: 'You see what others miss.',
        description: "You're wired to understand. Before you act, you want to know — really know. You collect information, spot patterns, and get to the bottom of things that confuse everyone else. This makes you invaluable when precision matters, and a trusted voice when the stakes are high.",
        traits: ['Detail-oriented', 'Logical', 'Curious', 'Thorough', 'Precise'],
        color: '#1B3B2B',
        tagBg: 'rgba(162,191,166,0.25)',
      },
      {
        id: 'visionary',
        title: 'The Visionary',
        emoji: '🚀',
        tagline: 'You think in possibilities.',
        description: "Your mind doesn't stay inside the box — it ignores the box entirely. You connect ideas that seem unrelated, spot opportunity in unexpected places, and get genuinely excited by the question \"what if?\". When others see a wall, you see a door that hasn't been built yet.",
        traits: ['Creative', 'Innovative', 'Big-picture', 'Adaptable', 'Bold'],
        color: '#E07A5F',
        tagBg: 'rgba(224,122,95,0.15)',
      },
      {
        id: 'connector',
        title: 'The Connector',
        emoji: '🤝',
        tagline: 'You lead with heart.',
        description: "You tune into people in a way most never learn to. You notice what's unspoken, care deeply about how others feel, and create trust naturally. Your empathy isn't a soft skill — it's a rare strength that moves teams, heals relationships, and makes the people around you feel genuinely seen.",
        traits: ['Empathetic', 'Perceptive', 'Warm', 'Trustworthy', 'Collaborative'],
        color: '#7a6aa0',
        tagBg: 'rgba(122,106,160,0.12)',
      },
      {
        id: 'strategist',
        title: 'The Strategist',
        emoji: '🗺️',
        tagline: 'You turn vision into reality.',
        description: "You're the person who actually makes things happen. While others are still talking about it, you're already three steps ahead — planning, sequencing, executing. You have a rare ability to stay focused on the goal without losing sight of the path, and you bring structure to chaos.",
        traits: ['Decisive', 'Focused', 'Organised', 'Reliable', 'Action-oriented'],
        color: '#1B3B2B',
        tagBg: 'rgba(27,59,43,0.1)',
      },
    ],
  },

  // ── 2. What Drives You ────────────────────────────────────────────────────
  {
    id: 'what-drives-you',
    emoji: '🔥',
    title: 'What drives you?',
    description: 'Uncover the core motivation behind your decisions and how you move through the world.',
    category: 'Identity & Personal Growth',
    estimatedMinutes: 4,
    questions: [
      {
        id: 'q1',
        text: 'What would feel like a truly successful year for you?',
        options: [
          { id: 'a', text: 'Hitting a goal that once felt impossible', scores: { achiever: 3 } },
          { id: 'b', text: 'Deepening the relationships that matter most', scores: { nurturer: 3 } },
          { id: 'c', text: 'Experiencing something completely new and unexpected', scores: { explorer: 3 } },
          { id: 'd', text: 'Building something stable and lasting', scores: { builder: 3 } },
        ],
      },
      {
        id: 'q2',
        text: "When you feel most like yourself, you're usually…",
        options: [
          { id: 'a', text: 'Pushing through a hard challenge', scores: { achiever: 3 } },
          { id: 'b', text: 'Being there for someone who needs you', scores: { nurturer: 3 } },
          { id: 'c', text: 'Somewhere new, doing something unfamiliar', scores: { explorer: 3 } },
          { id: 'd', text: 'Working steadily on something you believe in', scores: { builder: 3 } },
        ],
      },
      {
        id: 'q3',
        text: 'What kind of recognition means the most to you?',
        options: [
          { id: 'a', text: '"You did it — nobody thought that was possible"', scores: { achiever: 3 } },
          { id: 'b', text: '"You really showed up for me when I needed it"', scores: { nurturer: 3 } },
          { id: 'c', text: '"You always see something nobody else does"', scores: { explorer: 3 } },
          { id: 'd', text: '"Everything works because of what you built"', scores: { builder: 3 } },
        ],
      },
      {
        id: 'q4',
        text: 'What drains you fastest?',
        options: [
          { id: 'a', text: 'Doing the same thing over and over with no progress', scores: { achiever: 3, explorer: 1 } },
          { id: 'b', text: "Being around people who don't care about each other", scores: { nurturer: 3 } },
          { id: 'c', text: 'Being stuck in one place with no room to grow', scores: { explorer: 3 } },
          { id: 'd', text: 'Chaos with no structure or plan', scores: { builder: 3 } },
        ],
      },
      {
        id: 'q5',
        text: "You're given a free month to do anything. You'd use it to…",
        options: [
          { id: 'a', text: "Train for or achieve something you've always wanted", scores: { achiever: 3 } },
          { id: 'b', text: 'Invest deeply in the people you love most', scores: { nurturer: 3 } },
          { id: 'c', text: 'Travel somewhere completely unfamiliar', scores: { explorer: 3 } },
          { id: 'd', text: 'Build or create something from scratch', scores: { builder: 3 } },
        ],
      },
      {
        id: 'q6',
        text: 'At the end of your life, what legacy matters most to you?',
        options: [
          { id: 'a', text: 'The things I accomplished that most never could', scores: { achiever: 3 } },
          { id: 'b', text: 'The lives I made better just by being in them', scores: { nurturer: 3 } },
          { id: 'c', text: 'The experiences I had and the growth they brought', scores: { explorer: 3 } },
          { id: 'd', text: 'The things I built that outlasted me', scores: { builder: 3 } },
        ],
      },
    ],
    results: [
      {
        id: 'achiever',
        title: 'The Achiever',
        emoji: '🏆',
        tagline: 'You run toward the hard thing.',
        description: "You're fuelled by progress. Comfort zones bore you — it's the edge of your capability where you feel most alive. You set audacious goals and pursue them with a drive that can feel almost compulsive. What others call pressure, you call purpose. The win matters, but the growth matters more.",
        traits: ['Ambitious', 'Resilient', 'Driven', 'Goal-focused', 'Competitive'],
        color: '#E07A5F',
        tagBg: 'rgba(224,122,95,0.15)',
      },
      {
        id: 'nurturer',
        title: 'The Nurturer',
        emoji: '🌻',
        tagline: 'Your greatest power is love.',
        description: "You measure a good life by the depth of your relationships. You show up, you remember, you care — and the people around you feel it. Your instinct to nurture doesn't make you selfless to a fault; it makes you a force for genuine human connection in a world that often lacks it.",
        traits: ['Caring', 'Loyal', 'Present', 'Generous', 'Emotionally intelligent'],
        color: '#c5803a',
        tagBg: 'rgba(197,128,58,0.12)',
      },
      {
        id: 'explorer',
        title: 'The Explorer',
        emoji: '🌍',
        tagline: 'Growth is your compass.',
        description: "Staying still is the only thing that truly unsettles you. You're pulled by curiosity — new places, new ideas, new versions of yourself. You collect experiences the way others collect things. Your life is a map of moments, and you're always looking for the next uncharted territory.",
        traits: ['Curious', 'Open-minded', 'Adventurous', 'Adaptable', 'Restless'],
        color: '#1B3B2B',
        tagBg: 'rgba(162,191,166,0.25)',
      },
      {
        id: 'builder',
        title: 'The Builder',
        emoji: '🏗️',
        tagline: 'You make things that last.',
        description: "You think in systems and foundations. Whether it's a business, a home, a skill, or a community — you're drawn to creating things that endure. You're patient where others rush, and thorough where others cut corners. What drives you isn't the flash of a moment but the quiet pride of something built right.",
        traits: ['Patient', 'Dependable', 'Visionary', 'Structured', 'Legacy-minded'],
        color: '#3a5a8c',
        tagBg: 'rgba(58,90,140,0.1)',
      },
    ],
  },

  // ── 3. Love Language ──────────────────────────────────────────────────────
  {
    id: 'love-language',
    emoji: '💝',
    title: "What's your love language?",
    description: 'Discover how you naturally give and receive love — and what makes you feel most connected.',
    category: 'Relationships',
    estimatedMinutes: 3,
    questions: [
      {
        id: 'q1',
        text: 'After a hard week, what would mean the most to you?',
        options: [
          { id: 'a', text: 'Someone telling you exactly what they love about you', scores: { words: 3 } },
          { id: 'b', text: 'Uninterrupted, fully-present time with someone you love', scores: { quality: 3 } },
          { id: 'c', text: 'A friend quietly doing something helpful without being asked', scores: { acts: 3 } },
          { id: 'd', text: 'A long, warm hug that lasted just a little longer', scores: { touch: 3 } },
        ],
      },
      {
        id: 'q2',
        text: 'In a close relationship, what makes you feel most appreciated?',
        options: [
          { id: 'a', text: 'Heartfelt words — spoken, texted, or written', scores: { words: 3 } },
          { id: 'b', text: 'Dedicated, phone-free time that is just yours', scores: { quality: 3 } },
          { id: 'c', text: 'Someone handling the small things before you even notice', scores: { acts: 3 } },
          { id: 'd', text: 'A meaningful, well-chosen gift that shows they really know you', scores: { gifts: 3 } },
        ],
      },
      {
        id: 'q3',
        text: 'How do you most naturally show love to someone you care about?',
        options: [
          { id: 'a', text: 'Telling them how much they mean to you — often', scores: { words: 3 } },
          { id: 'b', text: 'Showing up and being fully present, every time', scores: { quality: 3 } },
          { id: 'c', text: 'Helping out before they even have to ask', scores: { acts: 3 } },
          { id: 'd', text: 'Finding or making something they will genuinely treasure', scores: { gifts: 3 } },
        ],
      },
      {
        id: 'q4',
        text: 'What would hurt most in a close relationship?',
        options: [
          { id: 'a', text: 'Feeling like your efforts and qualities go unacknowledged', scores: { words: 3 } },
          { id: 'b', text: 'Spending time together but feeling emotionally distant', scores: { quality: 3 } },
          { id: 'c', text: 'Having to handle everything alone without any support', scores: { acts: 3, touch: 1 } },
          { id: 'd', text: 'Feeling physically disconnected from someone you love', scores: { touch: 3 } },
        ],
      },
      {
        id: 'q5',
        text: 'Your ideal anniversary would involve…',
        options: [
          { id: 'a', text: 'A heartfelt letter or a moment of real, honest conversation', scores: { words: 3 } },
          { id: 'b', text: 'A full day with no distractions — just the two of you', scores: { quality: 3 } },
          { id: 'c', text: 'Something thoughtful they planned and organised entirely for you', scores: { acts: 3, gifts: 1 } },
          { id: 'd', text: 'A gift that proves they truly see and know you', scores: { gifts: 3 } },
        ],
      },
      {
        id: 'q6',
        text: 'After an argument, what helps you feel most reconnected?',
        options: [
          { id: 'a', text: 'Kind words and genuine, spoken reassurance', scores: { words: 3 } },
          { id: 'b', text: 'Sitting together and talking it through slowly', scores: { quality: 3, words: 1 } },
          { id: 'c', text: 'Them doing something small and caring without making a big deal of it', scores: { acts: 3 } },
          { id: 'd', text: 'A hug or physical closeness that breaks the distance', scores: { touch: 3 } },
        ],
      },
    ],
    results: [
      {
        id: 'words',
        title: 'Words of Affirmation',
        emoji: '💬',
        tagline: "You're moved by what is said.",
        description: "Verbal expression lands deeply for you. A genuine compliment, a heartfelt note, or hearing \"I love you\" out of nowhere — these things carry real weight. You don't need constant reassurance, but when someone articulates what they feel, it makes everything feel more real and more solid.",
        traits: ['Expressive', 'Sincere', 'Verbally attuned', 'Emotionally articulate', 'Affirming'],
        color: '#7a6aa0',
        tagBg: 'rgba(122,106,160,0.12)',
      },
      {
        id: 'quality',
        title: 'Quality Time',
        emoji: '⏳',
        tagline: 'Presence is everything to you.',
        description: "Being truly with someone — not just in the same room, but fully present — is how you feel loved. Distracted time together hardly counts. What you crave is undivided attention and genuine engagement. When someone makes you their whole focus, you feel it in a way that nothing else replicates.",
        traits: ['Present', 'Intentional', 'Connected', 'Attentive', 'Meaningful'],
        color: '#1B3B2B',
        tagBg: 'rgba(162,191,166,0.25)',
      },
      {
        id: 'acts',
        title: 'Acts of Service',
        emoji: '🙌',
        tagline: 'Love is something you do.',
        description: "Actions speak louder than words ever could for you. When someone makes your life a little easier — without being asked, without expecting credit — you feel it as love. You show up the same way: quietly, practically, and without fanfare. The doing is the caring.",
        traits: ['Helpful', 'Thoughtful', 'Devoted', 'Practical', 'Attentive'],
        color: '#3a5a8c',
        tagBg: 'rgba(58,90,140,0.1)',
      },
      {
        id: 'touch',
        title: 'Physical Touch',
        emoji: '🤗',
        tagline: 'Connection lives in closeness.',
        description: "Physical presence grounds you. A hand on your shoulder, a long hug, sitting close — these aren't just gestures to you, they're the language of safety and love. You read warmth through physical closeness in a way that words and gifts simply can't replicate.",
        traits: ['Warm', 'Physical', 'Present', 'Affectionate', 'Grounding'],
        color: '#E07A5F',
        tagBg: 'rgba(224,122,95,0.15)',
      },
      {
        id: 'gifts',
        title: 'Receiving Gifts',
        emoji: '🎁',
        tagline: 'Symbols carry real meaning for you.',
        description: "It is never about the price — it is about the thought behind it. A gift that proves someone paid attention, that they noticed something small you mentioned months ago, that they saw something and thought of you — that is the kind of thing that stays with you. You treasure the evidence of being truly known.",
        traits: ['Sentimental', 'Appreciative', 'Symbolic', 'Thoughtful', 'Memorable'],
        color: '#c5803a',
        tagBg: 'rgba(197,128,58,0.12)',
      },
    ],
  },

  // ── 4. Conflict Style ─────────────────────────────────────────────────────
  {
    id: 'conflict-style',
    emoji: '⚡',
    title: "What's your conflict style?",
    description: 'Understand how you handle tension and disagreement — and what that reveals about you.',
    category: 'Relationships',
    estimatedMinutes: 3,
    questions: [
      {
        id: 'q1',
        text: 'Someone close to you says something that bothers you. Your first instinct is to…',
        options: [
          { id: 'a', text: 'Say nothing — you need time to process before responding', scores: { avoider: 3 } },
          { id: 'b', text: 'Find a calm moment and bring it up directly but carefully', scores: { negotiator: 3 } },
          { id: 'c', text: 'Address it immediately — you prefer things to be out in the open', scores: { challenger: 3 } },
          { id: 'd', text: 'Try to understand their side before deciding how you feel', scores: { mediator: 3 } },
        ],
      },
      {
        id: 'q2',
        text: 'In an argument, what do you most want the other person to understand?',
        options: [
          { id: 'a', text: 'That you need space to think — not that you do not care', scores: { avoider: 3 } },
          { id: 'b', text: 'That there is a fair middle ground you both can live with', scores: { negotiator: 3 } },
          { id: 'c', text: 'That you deserve honesty, not politeness for its own sake', scores: { challenger: 3 } },
          { id: 'd', text: 'That both of your feelings are valid and worth hearing', scores: { mediator: 3 } },
        ],
      },
      {
        id: 'q3',
        text: 'Two friends are in a heated disagreement in front of you. You…',
        options: [
          { id: 'a', text: 'Feel uncomfortable and hope it resolves itself quickly', scores: { avoider: 3 } },
          { id: 'b', text: 'Offer a practical suggestion that works for both sides', scores: { negotiator: 3 } },
          { id: 'c', text: 'Say what you think honestly — even if it is not what they want to hear', scores: { challenger: 3 } },
          { id: 'd', text: 'Help each person feel heard before looking for a resolution', scores: { mediator: 3 } },
        ],
      },
      {
        id: 'q4',
        text: 'After a conflict, what do you need most to feel okay again?',
        options: [
          { id: 'a', text: 'Quiet time alone to reset and regain your footing', scores: { avoider: 3 } },
          { id: 'b', text: 'A clear sense that the issue is resolved and behind you', scores: { negotiator: 3 } },
          { id: 'c', text: 'Knowing the truth came out, even if it was uncomfortable', scores: { challenger: 3 } },
          { id: 'd', text: 'Feeling like both sides genuinely left the conversation whole', scores: { mediator: 3 } },
        ],
      },
      {
        id: 'q5',
        text: 'When someone is upset with you, your default reaction is…',
        options: [
          { id: 'a', text: 'Pulling back until the emotion settles', scores: { avoider: 3 } },
          { id: 'b', text: 'Trying to find the fastest reasonable path to resolution', scores: { negotiator: 3 } },
          { id: 'c', text: 'Wanting to get straight to the real issue without dancing around it', scores: { challenger: 3 } },
          { id: 'd', text: 'Genuinely trying to understand what you might have missed', scores: { mediator: 3 } },
        ],
      },
      {
        id: 'q6',
        text: 'What do you value most in how a conflict gets resolved?',
        options: [
          { id: 'a', text: 'That it ends peacefully, even if nothing is fully addressed', scores: { avoider: 3 } },
          { id: 'b', text: 'That both people walk away with something fair', scores: { negotiator: 3 } },
          { id: 'c', text: 'That the real issue was actually named and dealt with', scores: { challenger: 3 } },
          { id: 'd', text: 'That both people feel genuinely understood', scores: { mediator: 3 } },
        ],
      },
    ],
    results: [
      {
        id: 'avoider',
        title: 'The Avoider',
        emoji: '🌊',
        tagline: 'You keep the peace by pulling back.',
        description: "Conflict feels destabilising to you, so your instinct is to step away from it — to let the heat die down before engaging. This can be a genuine strength: you rarely escalate things, and you give others space to cool off. The growth edge is learning that some tensions need to be named to be healed.",
        traits: ['Calm', 'Non-reactive', 'Private', 'Sensitive', 'Peace-seeking'],
        color: '#3a5a8c',
        tagBg: 'rgba(58,90,140,0.1)',
      },
      {
        id: 'negotiator',
        title: 'The Negotiator',
        emoji: '🤝',
        tagline: 'You find the deal that works for both.',
        description: "You approach conflict like a problem to be solved fairly. You are rational under pressure, focused on outcomes, and genuinely willing to give ground to move things forward. Your strength is practicality — you find paths others miss. Watch out for settling too fast and leaving things only half-resolved.",
        traits: ['Practical', 'Fair-minded', 'Diplomatic', 'Solution-focused', 'Composed'],
        color: '#1B3B2B',
        tagBg: 'rgba(162,191,166,0.25)',
      },
      {
        id: 'challenger',
        title: 'The Challenger',
        emoji: '🔥',
        tagline: 'You name what others will not.',
        description: "You believe the only way through conflict is through it — directly, honestly, and without pretending. You have a low tolerance for things being swept under the rug, and you are often the one brave enough to say the thing no one else will. The growth edge is learning that timing and delivery matter as much as truth.",
        traits: ['Direct', 'Honest', 'Courageous', 'Confrontational', 'Clear'],
        color: '#E07A5F',
        tagBg: 'rgba(224,122,95,0.15)',
      },
      {
        id: 'mediator',
        title: 'The Mediator',
        emoji: '🌿',
        tagline: 'You hold space for everyone.',
        description: "You have a rare ability to make both sides of a conflict feel genuinely heard. You care more about understanding than winning, and you naturally see the humanity in each perspective. Your strength is that you restore connection. Your challenge is making sure your own needs and views get equal airtime too.",
        traits: ['Empathetic', 'Balanced', 'Patient', 'Perceptive', 'Healing'],
        color: '#7a6aa0',
        tagBg: 'rgba(122,106,160,0.12)',
      },
    ],
  },

  // ── 5. Energy Source ──────────────────────────────────────────────────────
  {
    id: 'energy-source',
    emoji: '✨',
    title: 'What energises you?',
    description: 'Find out what fills your tank — and what quietly drains it.',
    category: 'Identity & Personal Growth',
    estimatedMinutes: 3,
    questions: [
      {
        id: 'q1',
        text: 'After a long, demanding week — what actually restores you?',
        options: [
          { id: 'a', text: 'Being completely alone with no obligations', scores: { solitude: 3 } },
          { id: 'b', text: 'A long catch-up with people who get you', scores: { social: 3 } },
          { id: 'c', text: 'Losing yourself in something you are making or creating', scores: { creative: 3 } },
          { id: 'd', text: 'Moving your body — a run, a hike, a game, anything physical', scores: { movement: 3 } },
        ],
      },
      {
        id: 'q2',
        text: 'When you are at your very best, you are usually…',
        options: [
          { id: 'a', text: 'Working quietly by yourself, fully focused', scores: { solitude: 3 } },
          { id: 'b', text: 'In the middle of a lively conversation or group', scores: { social: 3 } },
          { id: 'c', text: 'Deep in a project that has no rules and no deadline', scores: { creative: 3 } },
          { id: 'd', text: 'Doing something physically demanding or active', scores: { movement: 3 } },
        ],
      },
      {
        id: 'q3',
        text: 'What does a genuinely good day look like for you?',
        options: [
          { id: 'a', text: 'Quiet, uninterrupted, with space to think at your own pace', scores: { solitude: 3 } },
          { id: 'b', text: 'Full of interactions — laughing, connecting, sharing', scores: { social: 3 } },
          { id: 'c', text: 'Making something from nothing, even just for yourself', scores: { creative: 3 } },
          { id: 'd', text: 'Getting outside and doing something active', scores: { movement: 3 } },
        ],
      },
      {
        id: 'q4',
        text: 'When you feel low or flat, what is the thing most likely to shift it?',
        options: [
          { id: 'a', text: 'A long walk alone with your thoughts', scores: { solitude: 3, movement: 1 } },
          { id: 'b', text: 'Time with someone whose company genuinely lifts you', scores: { social: 3 } },
          { id: 'c', text: 'Getting absorbed in a creative project or outlet', scores: { creative: 3 } },
          { id: 'd', text: 'A workout, a swim, or any form of physical release', scores: { movement: 3 } },
        ],
      },
      {
        id: 'q5',
        text: 'What kind of environment helps you do your best thinking?',
        options: [
          { id: 'a', text: 'Completely alone, with minimal noise and distraction', scores: { solitude: 3 } },
          { id: 'b', text: 'Around other people, even if I am not talking to them', scores: { social: 3 } },
          { id: 'c', text: 'A messy desk full of half-finished ideas and open tabs', scores: { creative: 3 } },
          { id: 'd', text: 'After or during some kind of physical activity', scores: { movement: 3 } },
        ],
      },
      {
        id: 'q6',
        text: 'If you had a completely free Saturday, you would most likely spend it…',
        options: [
          { id: 'a', text: 'Alone, reading, thinking, or pottering around without a plan', scores: { solitude: 3 } },
          { id: 'b', text: 'With people — brunch, an event, or just hanging out', scores: { social: 3 } },
          { id: 'c', text: 'Making, building, writing, or experimenting with something', scores: { creative: 3 } },
          { id: 'd', text: 'Doing something physical — a hike, sport, or long bike ride', scores: { movement: 3 } },
        ],
      },
    ],
    results: [
      {
        id: 'solitude',
        title: 'The Introvert Recharger',
        emoji: '🌙',
        tagline: 'Quiet is where you come alive.',
        description: "You do not need to be alone because you dislike people — you need it because that is where your best thinking lives. Solitude is your reset button, your creative space, and your source of clarity. You bring a rare depth to everything you do, precisely because you take time to actually process things fully.",
        traits: ['Reflective', 'Independent', 'Deep-thinking', 'Self-contained', 'Focused'],
        color: '#3a5a8c',
        tagBg: 'rgba(58,90,140,0.1)',
      },
      {
        id: 'social',
        title: 'The Social Energiser',
        emoji: '🌟',
        tagline: 'People fill your tank.',
        description: "You come alive around other people. Conversation, laughter, shared experiences — these are not distractions for you, they are fuel. You tend to think out loud, feel more yourself in company, and find that your energy genuinely rises when you are connected. The world feels more real when you are sharing it.",
        traits: ['Energetic', 'Warm', 'Outgoing', 'Connecting', 'Enthusiastic'],
        color: '#c5803a',
        tagBg: 'rgba(197,128,58,0.12)',
      },
      {
        id: 'creative',
        title: 'The Creative Flow',
        emoji: '🎨',
        tagline: 'Making things is how you breathe.',
        description: "You are at your most alive when you are in the middle of making something. The act of creating — whether it is writing, building, designing, cooking, or anything else — is not just a hobby, it is how you process the world. Flow state is real for you, and nothing compares to the feeling of being fully absorbed.",
        traits: ['Imaginative', 'Expressive', 'Flow-seeking', 'Inventive', 'Absorbed'],
        color: '#E07A5F',
        tagBg: 'rgba(224,122,95,0.15)',
      },
      {
        id: 'movement',
        title: 'The Physical Mover',
        emoji: '⚡',
        tagline: 'Your body leads, your mind follows.',
        description: "You think better when you move. A run clears your head, a workout resets your mood, and physical challenge is where you feel most like yourself. This is not just about fitness — it is about how your nervous system works. When you are physically active, everything else — clarity, mood, energy — falls into place.",
        traits: ['Active', 'Kinetic', 'Present', 'Grounded', 'Resilient'],
        color: '#1B3B2B',
        tagBg: 'rgba(162,191,166,0.25)',
      },
    ],
  },
  // ── 6. Attachment Style (18+) ─────────────────────────────────────────────
  {
    id: 'attachment-style',
    emoji: '🔗',
    title: 'What is your attachment style?',
    description: 'Uncover the deep patterns driving how you bond, love, and behave in romantic and sexual relationships.',
    category: 'Relationships & Intimacy',
    estimatedMinutes: 4,
    mature: true,
    questions: [
      {
        id: 'q1',
        text: 'After a night of intense sex with someone you care about, what do you feel most?',
        options: [
          { id: 'a', text: 'Close and satisfied — physical intimacy deepens my connection to them', scores: { secure: 3 } },
          { id: 'b', text: 'Anxious — I need reassurance that they feel the same way I do', scores: { anxious: 3 } },
          { id: 'c', text: 'Strangely distant — I feel an urge to have some space afterward', scores: { avoidant: 3 } },
          { id: 'd', text: 'A confusing mix — I want closeness but part of me wants to pull away fast', scores: { disorganized: 3 } },
        ],
      },
      {
        id: 'q2',
        text: "Your partner initiates sex less frequently than you'd like. Your instinct is to\u2026",
        options: [
          { id: 'a', text: 'Bring it up directly and talk about what we both need', scores: { secure: 3 } },
          { id: 'b', text: 'Worry that they are no longer attracted to me or losing interest', scores: { anxious: 3 } },
          { id: 'c', text: 'Say nothing and handle my needs independently', scores: { avoidant: 3 } },
          { id: 'd', text: 'Fluctuate between confronting it and convincing myself it does not matter', scores: { disorganized: 3 } },
        ],
      },
      {
        id: 'q3',
        text: 'When it comes to emotional vulnerability during sex, you…',
        options: [
          { id: 'a', text: 'Welcome it — being emotionally open makes sex more fulfilling for me', scores: { secure: 3 } },
          { id: 'b', text: 'Crave it intensely — I want to feel completely merged with my partner', scores: { anxious: 3 } },
          { id: 'c', text: 'Find it uncomfortable — I prefer to keep sex physical rather than emotional', scores: { avoidant: 3 } },
          { id: 'd', text: 'Feel torn — I want the depth but emotional exposure during sex unsettles me', scores: { disorganized: 3 } },
        ],
      },
      {
        id: 'q4',
        text: 'Your partner wants to explore a new sexual fantasy with you. How do you respond?',
        options: [
          { id: 'a', text: 'I am open and curious — I will talk it through and try it if we are both into it', scores: { secure: 3 } },
          { id: 'b', text: 'I agree quickly, even if I am unsure — I want them to feel satisfied by me', scores: { anxious: 3 } },
          { id: 'c', text: 'I feel resistant — stepping outside familiar territory makes me pull back', scores: { avoidant: 3 } },
          { id: 'd', text: 'I feel excited and terrified at the same time — I can not settle on how I feel', scores: { disorganized: 3 } },
        ],
      },
      {
        id: 'q5',
        text: 'After a fight, what do you need before sex feels right again?',
        options: [
          { id: 'a', text: 'A real conversation that resolves things — then sex comes naturally', scores: { secure: 3 } },
          { id: 'b', text: 'To feel fully forgiven and wanted — I use sex to reconnect and seek reassurance', scores: { anxious: 3 } },
          { id: 'c', text: 'Time and distance — I need to feel settled before I can be physically close again', scores: { avoidant: 3 } },
          { id: 'd', text: 'I often end up using sex to patch things up even when nothing is actually resolved', scores: { disorganized: 3 } },
        ],
      },
      {
        id: 'q6',
        text: 'Deep down, what do you believe about whether a relationship can truly be safe and fulfilling long-term?',
        options: [
          { id: 'a', text: 'Yes — with the right person and honest communication, it absolutely can', scores: { secure: 3 } },
          { id: 'b', text: 'I hope so, but I am always afraid it will fall apart if I am not careful enough', scores: { anxious: 3 } },
          { id: 'c', text: 'Probably not — relying on someone else always leads to disappointment eventually', scores: { avoidant: 3 } },
          { id: 'd', text: 'I want it desperately but I genuinely do not know if I am capable of letting it happen', scores: { disorganized: 3 } },
        ],
      },
    ],
    results: [
      {
        id: 'secure',
        title: 'Secure Attachment',
        emoji: '🌿',
        tagline: 'You love from a steady place.',
        description: "You bring a rare groundedness to intimacy. You can be emotionally present during sex, ask for what you want, and hold space for your partner's needs without losing yourself. You do not catastrophise when things get imperfect, and that security creates the conditions for genuine depth — emotional and physical. You are someone people feel safe to be fully themselves with.",
        traits: ['Emotionally available', 'Communicative', 'Sexually confident', 'Non-reactive', 'Deeply present'],
        color: '#1B3B2B',
        tagBg: 'rgba(162,191,166,0.25)',
      },
      {
        id: 'anxious',
        title: 'Anxious Attachment',
        emoji: '🌊',
        tagline: 'You love with your whole nervous system.',
        description: "Intimacy is both your greatest need and your biggest source of anxiety. You feel things intensely — the highs are electric, but the silences feel like rejection. In relationships, you may use sex to seek validation or closeness, sometimes agreeing to things to keep your partner happy rather than yourself. Learning to trust your own worth independent of their desire for you is your deepest work.",
        traits: ['Intensely feeling', 'Deeply devoted', 'Reassurance-seeking', 'Passionate', 'Hypervigilant'],
        color: '#3a5a8c',
        tagBg: 'rgba(58,90,140,0.1)',
      },
      {
        id: 'avoidant',
        title: 'Avoidant Attachment',
        emoji: '🏔️',
        tagline: 'You protect yourself through distance.',
        description: "You value independence in and out of the bedroom. Emotional closeness during sex can feel threatening — you may prefer keeping things physical without too much emotional weight attached. You are not cold; you just learned early that needing people was risky. The growth edge is letting someone close enough to see that vulnerability does not have to cost you your safety.",
        traits: ['Self-sufficient', 'Emotionally contained', 'Independent', 'Physically capable', 'Guarded'],
        color: '#E07A5F',
        tagBg: 'rgba(224,122,95,0.15)',
      },
      {
        id: 'disorganized',
        title: 'Disorganized Attachment',
        emoji: '⚡',
        tagline: 'You want closeness and fear it equally.',
        description: "Intimacy for you is a battlefield of contradictory impulses — you want it desperately and it terrifies you at the same time. Sex can feel like both a path to connection and a source of shame or confusion. Your relationships may swing between intense closeness and sudden withdrawal. This is one of the most painful patterns to carry — and also one of the most transformable with self-awareness and the right support.",
        traits: ['Intensely complex', 'Self-aware', 'Deeply feeling', 'Unpredictable in love', 'Healing in progress'],
        color: '#7a6aa0',
        tagBg: 'rgba(122,106,160,0.12)',
      },
    ],
  },

  // ── 7. Desire Style (18+) ──────────────────────────────────────────────────
  {
    id: 'desire-style',
    emoji: '🔥',
    title: 'What is your desire style?',
    description: 'Discover how you experience sexual desire, what ignites your attraction, and what you genuinely need to feel turned on.',
    category: 'Sex & Desire',
    estimatedMinutes: 4,
    mature: true,
    questions: [
      {
        id: 'q1',
        text: 'How does sexual desire typically show up for you?',
        options: [
          { id: 'a', text: 'Randomly and out of nowhere — I get horny regardless of context', scores: { spontaneous: 3 } },
          { id: 'b', text: 'Only when the conditions are right — I need to feel safe and connected first', scores: { responsive: 3 } },
          { id: 'c', text: 'Slowly, through physical sensation and atmosphere — touch, smell, mood all matter', scores: { sensual: 3 } },
          { id: 'd', text: 'Through novelty and intensity — I need something exciting or unfamiliar to feel really turned on', scores: { experimental: 3 } },
        ],
      },
      {
        id: 'q2',
        text: 'What makes sex genuinely good for you?',
        options: [
          { id: 'a', text: 'The release and urgency — I like it passionate, direct, and unplanned', scores: { spontaneous: 3 } },
          { id: 'b', text: 'Feeling emotionally close and fully trusted — the intimacy makes the sex', scores: { responsive: 3 } },
          { id: 'c', text: 'Slow build, full-body sensation, and real attention to every part of the experience', scores: { sensual: 3 } },
          { id: 'd', text: 'Trying something new — different scenarios, positions, power dynamics, or fantasies', scores: { experimental: 3 } },
        ],
      },
      {
        id: 'q3',
        text: 'You have been in a long-term relationship for two years. How has your sex life evolved?',
        options: [
          { id: 'a', text: 'My desire is still spontaneous — familiarity does not dim it much for me', scores: { spontaneous: 3 } },
          { id: 'b', text: 'Deeper trust has actually made sex better — I am more open now than early on', scores: { responsive: 3 } },
          { id: 'c', text: 'We have gotten better at the sensory and atmospheric side of things together', scores: { sensual: 3 } },
          { id: 'd', text: 'We have had to work harder to keep things adventurous — novelty matters a lot to me', scores: { experimental: 3 } },
        ],
      },
      {
        id: 'q4',
        text: 'Which scenario sounds most arousing to you?',
        options: [
          { id: 'a', text: 'Your partner pulls you in and initiates sex without warning, mid-afternoon', scores: { spontaneous: 3 } },
          { id: 'b', text: 'A long evening of deep conversation and closeness that naturally leads to sex', scores: { responsive: 3 } },
          { id: 'c', text: 'Candles, slow music, a full body massage that turns into something more', scores: { sensual: 3 } },
          { id: 'd', text: 'Roleplaying a scenario or trying something neither of you has done before', scores: { experimental: 3 } },
        ],
      },
      {
        id: 'q5',
        text: 'What is most likely to kill your desire?',
        options: [
          { id: 'a', text: 'Routine — the same time, same way, same script every time', scores: { spontaneous: 3, experimental: 1 } },
          { id: 'b', text: 'Feeling emotionally disconnected, tense, or unresolved with my partner', scores: { responsive: 3 } },
          { id: 'c', text: 'Being rushed, skipping the build-up, or sex that feels purely mechanical', scores: { sensual: 3 } },
          { id: 'd', text: 'Knowing exactly what is going to happen before it starts', scores: { experimental: 3 } },
        ],
      },
      {
        id: 'q6',
        text: 'How honest are you with partners about your specific sexual wants and turn-ons?',
        options: [
          { id: 'a', text: 'Fairly direct — I usually just show them or say it in the moment', scores: { spontaneous: 3 } },
          { id: 'b', text: 'I open up gradually as trust builds — I need to feel safe before I share', scores: { responsive: 3 } },
          { id: 'c', text: 'I express it through physical cues, sounds, and response more than words', scores: { sensual: 3 } },
          { id: 'd', text: 'Very open — talking about fantasies and desires is something I actually enjoy', scores: { experimental: 3 } },
        ],
      },
    ],
    results: [
      {
        id: 'spontaneous',
        title: 'Spontaneous Desire',
        emoji: '⚡',
        tagline: 'Desire hits you like a spark.',
        description: "Your sexual desire is immediate and context-independent. It does not need the right mood, a long build-up, or a perfectly timed moment — it just arrives, uninvited and often. You are capable of wanting sex in the middle of a supermarket or straight after an argument. This kind of drive is a genuine asset in relationships, though partners with responsive desire may need more time to catch up. Communicating that difference openly makes all the difference.",
        traits: ['High sex drive', 'Spontaneous', 'Direct', 'Physically expressive', 'Initiative-taker'],
        color: '#E07A5F',
        tagBg: 'rgba(224,122,95,0.15)',
      },
      {
        id: 'responsive',
        title: 'Responsive Desire',
        emoji: '🌿',
        tagline: 'Your desire wakes up when conditions are right.',
        description: "You rarely feel desire out of nowhere — but when the emotional temperature is right, your sexuality is deep, connected, and fully present. For you, feeling emotionally safe, trusted, and desired is not a nice-to-have; it is what turns you on. You are not low-libido — you are context-dependent. The implication is that intimacy, communication, and emotional attunement are your most powerful aphrodisiacs.",
        traits: ['Emotionally driven', 'Context-sensitive', 'Deeply intimate', 'Attentive', 'Trust-dependent'],
        color: '#1B3B2B',
        tagBg: 'rgba(162,191,166,0.25)',
      },
      {
        id: 'sensual',
        title: 'Sensual Desire',
        emoji: '🕯️',
        tagline: 'Your whole body is involved.',
        description: "For you, sex is a full-body, full-sensory experience. Touch, scent, sound, rhythm, and atmosphere are not extras — they are the experience. You are turned on by slow builds, extended foreplay, and the kind of attention that treats every inch of your body as worth exploring. You want to be fully present in your body during sex, not rushing toward an endpoint. Partners who slow down for you will discover a depth of pleasure that is genuinely extraordinary.",
        traits: ['Highly sensory', 'Present', 'Tactile', 'Atmospheric', 'Deeply embodied'],
        color: '#c5803a',
        tagBg: 'rgba(197,128,58,0.12)',
      },
      {
        id: 'experimental',
        title: 'Experimental Desire',
        emoji: '🧪',
        tagline: 'Novelty is your greatest turn-on.',
        description: "Your desire thrives on the new, the unexpected, and the boundary-pushing. You are genuinely excited by exploring kinks, fantasies, power dynamics, or scenarios that sit outside the ordinary. Routine kills your drive; novelty resurrects it. You are sexually curious and brave, and your willingness to explore tends to unlock things in partners that they did not know were there. The key is finding partners who share that appetite — or who are at least genuinely open to it.",
        traits: ['Adventurous', 'Kink-curious', 'Open-minded', 'Boundary-exploring', 'Highly imaginative'],
        color: '#7a6aa0',
        tagBg: 'rgba(122,106,160,0.12)',
      },
    ],
  },

  // ── 8. Sex Communication Style (18+) ──────────────────────────────────────
  {
    id: 'sex-communication',
    emoji: '💬',
    title: 'How do you communicate about sex?',
    description: 'Find out how you express needs, set boundaries, and build emotional and sexual intimacy through communication.',
    category: 'Sex & Desire',
    estimatedMinutes: 4,
    mature: true,
    questions: [
      {
        id: 'q1',
        text: 'Your partner does something in bed that you do not enjoy. What do you do?',
        options: [
          { id: 'a', text: 'Say something clearly, right away — I have no problem speaking up in the moment', scores: { direct: 3 } },
          { id: 'b', text: 'Mention it afterward when we are both relaxed and can talk properly', scores: { open: 3 } },
          { id: 'c', text: 'Redirect them physically without saying anything — I show rather than tell', scores: { physical: 3 } },
          { id: 'd', text: 'Stay quiet — it feels too awkward to bring up, so I just wait for it to stop', scores: { guarded: 3 } },
        ],
      },
      {
        id: 'q2',
        text: 'When you have a new sexual fantasy you want to try, how do you handle it?',
        options: [
          { id: 'a', text: 'I bring it up directly — I say exactly what I want and why it turns me on', scores: { direct: 3 } },
          { id: 'b', text: 'I find a comfortable moment and share it openly, as part of a wider conversation about us', scores: { open: 3 } },
          { id: 'c', text: 'I initiate something that hints at it and see how they respond physically first', scores: { physical: 3 } },
          { id: 'd', text: 'I keep it to myself — sharing a fantasy feels too vulnerable or risky', scores: { guarded: 3 } },
        ],
      },
      {
        id: 'q3',
        text: 'How comfortable are you explicitly saying what you want during sex — out loud, in the moment?',
        options: [
          { id: 'a', text: 'Very comfortable — dirty talk and clear verbal direction come naturally to me', scores: { direct: 3 } },
          { id: 'b', text: 'Comfortable, especially with a partner I trust — I can say what I need', scores: { open: 3 } },
          { id: 'c', text: 'More comfortable through sounds and touch than actual words', scores: { physical: 3 } },
          { id: 'd', text: 'Not very — saying it out loud feels too exposing, even with someone I am close to', scores: { guarded: 3 } },
        ],
      },
      {
        id: 'q4',
        text: 'A new partner asks what your sexual boundaries are before anything has happened. You…',
        options: [
          { id: 'a', text: 'Appreciate it and answer straightforwardly — I know my limits and can name them clearly', scores: { direct: 3 } },
          { id: 'b', text: 'Welcome it — it builds trust and makes me more comfortable being honest in return', scores: { open: 3 } },
          { id: 'c', text: 'Feel a little awkward with the explicit conversation — I prefer to feel it out physically', scores: { physical: 3 } },
          { id: 'd', text: 'Feel put on the spot — I struggle to articulate my limits even to myself', scores: { guarded: 3 } },
        ],
      },
      {
        id: 'q5',
        text: 'After sex that was not great, how likely are you to talk about it?',
        options: [
          { id: 'a', text: 'Very likely — I would rather address it quickly than let it silently repeat', scores: { direct: 3 } },
          { id: 'b', text: 'I would bring it up gently but honestly, framed as us improving together', scores: { open: 3 } },
          { id: 'c', text: 'I probably would not talk about it — I would just initiate differently next time', scores: { physical: 3 } },
          { id: 'd', text: 'Unlikely — I worry it would embarrass or upset them, so I would stay quiet', scores: { guarded: 3 } },
        ],
      },
      {
        id: 'q6',
        text: 'How deeply do you connect emotional intimacy with your ability to enjoy sex?',
        options: [
          { id: 'a', text: 'I can fully separate them — great sex does not require deep emotional closeness for me', scores: { direct: 3 } },
          { id: 'b', text: 'Emotional closeness makes sex significantly better, but it is not a requirement', scores: { open: 3 } },
          { id: 'c', text: 'Physical intimacy is how I build emotional closeness — for me, they are the same thing', scores: { physical: 3 } },
          { id: 'd', text: 'I struggle to be fully open sexually without a strong emotional foundation first', scores: { guarded: 3 } },
        ],
      },
    ],
    results: [
      {
        id: 'direct',
        title: 'The Direct Communicator',
        emoji: '🎯',
        tagline: 'You say exactly what you want.',
        description: "You have no problem naming your desires, limits, and needs out loud — in the moment, before, or after. For you, clear sexual communication is not awkward; it is just efficient and respectful. You can tell a partner exactly what feels good, set a boundary without drama, and discuss a fantasy without it feeling like a big deal. This is a rare quality that makes you a genuinely good sexual partner, because people always know where they stand with you.",
        traits: ['Verbally confident', 'Boundary-clear', 'Direct', 'Unapologetic', 'Self-knowing'],
        color: '#E07A5F',
        tagBg: 'rgba(224,122,95,0.15)',
      },
      {
        id: 'open',
        title: 'The Open Sharer',
        emoji: '🌱',
        tagline: 'You build intimacy through honest conversation.',
        description: "You are emotionally fluent when it comes to sex and intimacy. You prefer to talk things through — not as a clinical exercise, but as a genuine extension of closeness. You share fantasies, check in with partners, and are willing to have the slightly uncomfortable conversations because you know they lead somewhere better. You understand that emotional openness and sexual openness feed each other, and you are good at cultivating both.",
        traits: ['Emotionally open', 'Reflective', 'Trust-building', 'Genuine', 'Growth-oriented'],
        color: '#1B3B2B',
        tagBg: 'rgba(162,191,166,0.25)',
      },
      {
        id: 'physical',
        title: 'The Physical Communicator',
        emoji: '🤲',
        tagline: 'Your body speaks louder than your words.',
        description: "Words are not your primary language in the bedroom — touch, movement, breath, and response are. You redirect a partner with your hands, express desire through sounds and closeness, and build intimacy through physical attunement rather than verbal conversation. This can be deeply powerful and intuitive. The growth edge is learning that some things — limits, feelings, shifting needs — benefit from being named explicitly, even if it is uncomfortable at first.",
        traits: ['Physically expressive', 'Intuitive', 'Non-verbal', 'Sensory', 'In-the-moment'],
        color: '#c5803a',
        tagBg: 'rgba(197,128,58,0.12)',
      },
      {
        id: 'guarded',
        title: 'The Guarded Opener',
        emoji: '🔑',
        tagline: 'Vulnerability is something you earn the right to.',
        description: "Talking about sex openly is genuinely hard for you — not because you have nothing to say, but because exposing your desires and limits feels deeply vulnerable. You may have learned that expressing sexual needs leads to judgment, rejection, or disappointment. The result is that you often go unmet or settle for less than you want rather than risking the discomfort of asking. The work here is not learning to be loud — it is learning that your needs are worth the small risk of saying them out loud.",
        traits: ['Deeply private', 'Self-protective', 'Emotionally careful', 'Unexpressed potential', 'Growth-ready'],
        color: '#7a6aa0',
        tagBg: 'rgba(122,106,160,0.12)',
      },
    ],
  },
]

// ── Insight combinations (thinking-style × what-drives-you) ──────────────────
export const insightCombinations: Record<string, { headline: string; body: string }> = {
  'analyst-achiever': { headline: 'The Precision Achiever', body: 'You set the bar high and bring the data to prove you cleared it. You do not just reach goals — you engineer them.' },
  'analyst-nurturer': { headline: 'The Thoughtful Carer', body: 'You show love through thoroughness, not grand gestures. The people around you feel steadied by how carefully you pay attention.' },
  'analyst-explorer': { headline: 'The Deep Diver', body: "You are driven by questions — and every answer opens three more doors. Curiosity is not just a trait, it's your engine." },
  'analyst-builder': { headline: 'The Architect', body: 'You think ten steps ahead and build accordingly. Systems, foundations, and long-view thinking are where you genuinely shine.' },

  'visionary-achiever': { headline: 'The Audacious Maker', body: "You dream at the edge of what's possible — then sprint toward it. The gap between your ambition and your execution is smaller than most." },
  'visionary-nurturer': { headline: 'The Possibility Spotter', body: 'You see potential in people others overlook and help them grow into it. That is a rare and genuinely powerful combination.' },
  'visionary-explorer': { headline: 'The Horizon Chaser', body: "You're always chasing the next horizon — and somehow finding something remarkable when you get there. Restlessness is your gift." },
  'visionary-builder': { headline: 'The Visionary Builder', body: 'You hold the rare mix of radical ideas and patient execution. You do not just imagine what could be — you actually build it.' },

  'connector-achiever': { headline: 'The Magnetic Leader', body: 'You win people over first, then take them somewhere extraordinary. Your drive and warmth together make others want to follow.' },
  'connector-nurturer': { headline: 'The Heart of the Room', body: 'You are the glue — the one people orbit because they feel genuinely seen. That is not a soft skill; it is a rare form of power.' },
  'connector-explorer': { headline: 'The Relational Explorer', body: 'You find yourself through other people. Every relationship opens up a new part of who you are, and who you are becoming.' },
  'connector-builder': { headline: 'The Community Builder', body: 'You build for people and with people. Legacy and love, bound together — that is what drives the things you create.' },

  'strategist-achiever': { headline: 'The Execution Machine', body: "You don't just set goals — you engineer the path and run it faster than anyone expected. Very little falls through the cracks with you." },
  'strategist-nurturer': { headline: 'The Steady Anchor', body: 'You hold people together with structure they never knew they needed. You are the person everyone leans on when things get difficult.' },
  'strategist-explorer': { headline: 'The Adaptive Planner', body: "You chart the course, but you're always open to discovering a better one. Planning is your strength; adaptability is your superpower." },
  'strategist-builder': { headline: 'The Architect of Futures', body: 'Methodical, long-view, and unshakeable — you do not just plan for tomorrow, you design for the next decade.' },
}

export function getQuizById(id: string): Quiz | undefined {
  return quizzes.find(q => q.id === id)
}

export function scoreQuiz(quiz: Quiz, answers: Record<string, string>): QuizResultType {
  const totals: Record<string, number> = {}
  quiz.results.forEach(r => { totals[r.id] = 0 })

  for (const [questionId, optionId] of Object.entries(answers)) {
    const question = quiz.questions.find(q => q.id === questionId)
    const option = question?.options.find(o => o.id === optionId)
    if (option) {
      for (const [resultId, score] of Object.entries(option.scores)) {
        totals[resultId] = (totals[resultId] ?? 0) + score
      }
    }
  }

  const winnerId = Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0]
  return quiz.results.find(r => r.id === winnerId)!
}
