// Deep-dive reports & action plans gated behind Koru Pro.
// Keyed by `${quizId}/${resultTypeId}` — looked up from the Quiz result page.

export interface DeepReport {
  deepDive: string[] // paragraphs of in-depth analysis
  actionPlan: { title: string; detail: string }[] // 3 actionable steps
}

export const deepReports: Record<string, DeepReport> = {
  // ── Thinking Style ────────────────────────────────────────────────────────
  'thinking-style/analyst': {
    deepDive: [
      "Your analytical mind is a genuine superpower, but it has a shadow side: analysis paralysis. When faced with too many options or incomplete data, you can get stuck in research mode, gathering more information than you actually need to act. The key insight is that 80% of the value comes from 20% of the information — learning to act on 'good enough' data is your biggest growth edge.",
      "In your career, you thrive in roles that reward depth over breadth — research, engineering, strategy, data-driven decision-making. But you may struggle in fast-moving environments where speed matters more than precision. Your challenge is learning to distinguish between situations that deserve your full analytical rigour and those where a quick, 'good enough' decision is actually the better call.",
    ],
    actionPlan: [
      { title: `Set a decision deadline`, detail: `For your next big decision, set a hard deadline before you start researching. When the deadline arrives, commit to the best option you have — no more data gathering.` },
      { title: `Practice "70% confidence" rule`, detail: `Start acting when you are 70% confident, not 100%. Track outcomes to build trust that imperfect decisions still work out.` },
      { title: `Pair with a visionary`, detail: `Find someone who thinks in possibilities, not just probabilities. Their speed will pull you forward; your rigour will keep them grounded.` },
    ],
  },
  'thinking-style/visionary': {
    deepDive: [
      "Your visionary thinking means you see connections and possibilities others miss entirely. But this same gift can become a liability: you generate ten ideas for every one you pursue, and the excitement of the new can pull you away from finishing what you started. The world doesn't lack good ideas — it lacks people who can execute them.",
      "Your superpower is most valuable at the start of projects, in brainstorming sessions, and in moments that need a paradigm shift. But your growth edge is the middle and end — the unglamorous, disciplined work of turning a spark into something real. Learning to fall in love with execution, not just ideation, is what separates visionaries who dream from visionaries who deliver.",
    ],
    actionPlan: [
      { title: `Commit to one idea for 30 days`, detail: `Pick your best current idea and commit to it for 30 days — no new projects. Build, test, or ship something tangible in that window.` },
      { title: `Build a "parking lot" system`, detail: `When a new idea hits, write it in a dedicated note instead of acting on it. Review the list monthly. Most will lose their shine — the few that survive deserve your energy.` },
      { title: `Partner with a strategist`, detail: `Find someone who excels at turning ideas into step-by-step plans. They will give your vision legs; you will give their plans wings.` },
    ],
  },
  'thinking-style/connector': {
    deepDive: [
      "Your connector mind reads rooms, senses unspoken dynamics, and builds trust where others build walls. But this emotional intelligence can become a trap: you may absorb others' emotions so deeply that you lose track of your own, or prioritise harmony over honesty until resentment quietly builds.",
      "In your career, you shine in roles that require human insight — leadership, coaching, therapy, sales, community-building. Your challenge is learning that true connection sometimes requires difficult conversations, not just empathetic listening. The people who trust you most don't need you to agree with them — they need you to be honest, even when it's uncomfortable.",
    ],
    actionPlan: [
      { title: `Practice "compassionate directness"`, detail: `This week, have one conversation you have been avoiding. Lead with care, but say the true thing. Notice that honesty deepens trust rather than breaking it.` },
      { title: `Set an emotional boundary`, detail: `Identify one person whose emotions you absorb too deeply. Before your next interaction, decide what is theirs to carry and what is yours. Hold that line.` },
      { title: `Name your own need`, detail: `For one week, before checking in on others, ask yourself: "What do I need right now?" Write it down. Practice putting your own oxygen mask on first.` },
    ],
  },
  'thinking-style/strategist': {
    deepDive: [
      "Your strategist mind turns chaos into order. You see the path from A to Z, sequence the steps, and execute with a discipline that most people only aspire to. But this strength has a blind spot: you can become so focused on the plan that you miss emerging opportunities, or so attached to efficiency that you skip the human element that makes plans actually work.",
      "In your career, you are the person who makes things happen — project management, operations, entrepreneurship, execution-focused leadership. Your growth edge is learning that the best plan is sometimes the one you are willing to abandon. Flexibility isn't the opposite of strategy; it's strategy's most underrated ingredient.",
    ],
    actionPlan: [
      { title: `Build in a "pivot checkpoint"`, detail: `At the halfway point of your next project, ask: "If I were starting today, would I still choose this plan?" If not, adjust — don't just push through.` },
      { title: `Make time for unstructured exploration`, detail: `Schedule 2 hours this week with no agenda, no list, no goal. Let your mind wander. Some of your best strategic insights will come from the space between tasks.` },
      { title: `Invest in the human side`, detail: `Before your next project kicks off, spend time understanding the people involved — their motivations, fears, and working styles. A plan that ignores people is a plan that fails.` },
    ],
  },

  // ── What Drives You ───────────────────────────────────────────────────────
  'what-drives-you/achiever': {
    deepDive: [
      "Your drive is fuelled by the pursuit of the impossible made possible. You set goals that intimidate most people and pursue them with a relentlessness that can look like obsession from the outside. But this drive has a shadow: you may tie your self-worth to your accomplishments, creating a cycle where no achievement is ever enough because the finish line keeps moving.",
      "The deepest question for you is not 'what can I achieve?' but 'what is worth achieving?' Your ambition is a powerful engine, but without a clear sense of what actually matters to you — beyond the next milestone — you risk spending your life climbing a ladder leaning against the wrong wall. The most fulfilled achievers aren't the ones who do the most; they're the ones who chose what to do with intention.",
    ],
    actionPlan: [
      { title: `Define your "enough"`, detail: `Write down what a genuinely fulfilling life looks like — not in achievements, but in relationships, health, peace. Re-read it when you feel the pull to chase the next thing.` },
      { title: `Celebrate before the next goal`, detail: `After your next win, force yourself to pause for 48 hours before setting the next target. Sit with the accomplishment. Let it land.` },
      { title: `Explore being vs. doing`, detail: `Spend one day this week with no goals, no metrics, no productivity. Just be. Notice the discomfort — and then notice that you survived it.` },
    ],
  },
  'what-drives-you/nurturer': {
    deepDive: [
      "Your nurturing drive is the quiet force that holds communities, families, and friendships together. You measure your life by the depth of your connections, not the height of your achievements. But this beautiful orientation has a risk: you can give so much that you empty yourself, or care so deeply that you lose sight of where you end and others begin.",
      "The paradox of nurturing is that the best way to care for others is to first care for yourself. People who burn out from over-giving become less present, not more. Your growth edge is learning that setting boundaries isn't selfish — it's the most generous thing you can do, because it makes your care sustainable instead of self-sacrificing.",
    ],
    actionPlan: [
      { title: `Schedule yourself first`, detail: `Before filling your calendar with others' needs this week, block out time for yourself first. Treat it as non-negotiable.` },
      { title: `Practice receiving`, detail: `When someone offers help this week, say yes without deflecting. Let yourself be cared for. Notice how it feels.` },
      { title: `Audit your giving`, detail: `List the people you pour into most. Ask: is this reciprocal? Is it draining or filling? Adjust one relationship that feels one-sided.` },
    ],
  },
  'what-drives-you/explorer': {
    deepDive: [
      "Your explorer drive is powered by curiosity and the pull of the unknown. You collect experiences, embrace change, and feel most alive when you are on the edge of what is familiar. But this restlessness can become a form of avoidance: always moving means never having to sit with discomfort, and the next adventure can become a way to escape the present rather than embrace it.",
      "The deepest growth for you is learning that not all exploration is external. The most transformative journeys are sometimes the ones that go inward — staying still long enough to discover what you actually feel, what you truly want, and who you are when you stop moving. Adventure and rootedness are not opposites; the most interesting explorers have both.",
    ],
    actionPlan: [
      { title: `Stay in one place for 30 days`, detail: `Commit to not starting anything new for 30 days. Go deeper into what is already in your life. Notice what surfaces when the novelty wears off.` },
      { title: `Explore inward`, detail: `Start a daily 10-minute journaling practice. The most uncharted territory is your own inner world. Ask: what am I running toward, and what am I running from?` },
      { title: `Build a home base`, detail: `Create one space, routine, or relationship that feels like an anchor — something you return to, not something you pass through. Rootedness makes adventure richer.` },
    ],
  },
  'what-drives-you/builder': {
    deepDive: [
      "Your builder drive is oriented toward legacy — creating things that outlast you. You think in systems, foundations, and long time horizons. This patience and thoroughness is rare and valuable. But it has a shadow: you may delay gratification so long that you never enjoy what you are building, or perfectionism may keep you from ever calling something 'done.'",
      "The question that matters most for you is: what are you building toward, and is it worth the life you are spending on it? Builders can be so focused on the structure that they forget to live in it. The most fulfilled builders aren't the ones who build the biggest things — they're the ones who build things that matter to them, and who enjoy the process along the way.",
    ],
    actionPlan: [
      { title: `Define "done"`, detail: `For your current project, write down the specific criteria that will make it complete. When you hit them, stop. Ship it. Celebrate.` },
      { title: `Enjoy the half-built`, detail: `This week, take time to appreciate what you have already built, even if it is unfinished. Share it with someone. Let it be seen in its imperfect state.` },
      { title: `Question the foundation`, detail: `Ask: if this project succeeds perfectly, will it make my life better — or just busier? If the answer is busier, reconsider what you are building.` },
    ],
  },

  // ── Love Language ─────────────────────────────────────────────────────────
  'love-language/words': {
    deepDive: [
      "Words of affirmation as your love language means verbal expression carries real weight for you. A genuine compliment, a heartfelt 'I'm proud of you,' or an unexpected 'I love you' can shift your entire emotional state. But this sensitivity means you are also deeply wounded by harsh words, criticism, or silence — what goes unsaid can feel like a withdrawal from the emotional bank account.",
      "In relationships, your growth edge is learning that not everyone expresses love verbally — and that absence of words does not mean absence of love. A partner who shows love through acts of service may never say what you need to hear, but their actions are speaking. Learning to translate other love languages into your own is the key to feeling loved by people who love you differently.",
    ],
    actionPlan: [
      { title: `Ask for what you need`, detail: `Tell your partner or close friend: "It really matters to me when you tell me what you appreciate about me." Most people want to love you well — they just need to know how.` },
      { title: `Learn their language`, detail: `Identify one loved one's love language. This week, express love in their language, not yours. Notice how it lands differently.` },
      { title: `Write the unsaid`, detail: `Write a letter to someone you love saying everything you have been feeling but haven't spoken. You don't have to send it — but you do have to let the words out.` },
    ],
  },
  'love-language/quality': {
    deepDive: [
      "Quality time as your love language means presence is your deepest currency. Undivided attention — phone away, eyes meeting, fully there — makes you feel more loved than any gift or words ever could. But this also means distracted time feels like rejection: a partner scrolling through their phone during dinner doesn't just annoy you; it wounds you.",
      "Your growth edge is learning to communicate this need without making others feel guilty for their natural distractibility, and to recognise that quality time doesn't require perfection. A five-minute, fully-present conversation can fill your tank more than a two-hour, half-present evening. It's about depth of presence, not duration.",
    ],
    actionPlan: [
      { title: `Name the need clearly`, detail: `Tell your loved one: "When we are together, having your full attention makes me feel deeply loved. Can we have phone-free time?" Frame it as a request, not a complaint.` },
      { title: `Create a daily ritual`, detail: `Establish a 10-minute daily ritual with someone you love — morning coffee, evening walk, no phones. Consistency of presence matters more than length.` },
      { title: `Be present with yourself`, detail: `Spend 15 minutes a day fully present with yourself — no phone, no music, no distraction. The quality of your relationship with yourself sets the tone for all others.` },
    ],
  },
  'love-language/acts': {
    deepDive: [
      "Acts of service as your love language means love is something you do, not something you say. When someone anticipates your needs and handles them without being asked, you feel deeply seen. But this can create a hidden dynamic: you may give so much through acts that you build quiet resentment when it's not reciprocated, or you may struggle to ask for help because receiving feels like a burden to others.",
      "Your growth edge is learning that asking for what you need is not a burden — it's an invitation. People who love you want to serve you too, but they can't read your mind. And not everyone expresses love through acts; someone who never lifts a finger to help but always tells you they love you may love you just as deeply, just in a different language.",
    ],
    actionPlan: [
      { title: `Let yourself be served`, detail: `This week, when someone offers to help, say "Yes, that would be wonderful" instead of "I'm fine." Practice receiving without guilt.` },
      { title: `Ask specifically`, detail: `Instead of hoping someone notices what you need, say: "It would mean a lot if you could handle [specific task]." Clear requests get fulfilled; vague hopes don't.` },
      { title: `Notice other languages`, detail: `For one week, track how each loved one expresses love — their words, time, touch, gifts. You may be missing love that is already there, just in a different form.` },
    ],
  },
  'love-language/touch': {
    deepDive: [
      "Physical touch as your love language means connection lives in your body. A hand on your shoulder, a long hug, sitting close — these aren't just gestures; they are how you feel safe, loved, and grounded. But this also means physical distance or a lack of touch can leave you feeling emotionally starved, even in an otherwise loving relationship.",
      "Your growth edge is learning that touch is a need, not a want, and communicating it without making your partner feel inadequate. It's also learning that non-romantic touch matters: hugs from friends, a hand on the arm from a colleague, even self-touch like a warm bath can help meet this need when a partner isn't available or isn't physically affectionate.",
    ],
    actionPlan: [
      { title: `Communicate the need`, detail: `Tell your partner: "Physical closeness is how I feel most loved. When we go a day without touch, I feel disconnected." This is not a complaint — it is a map to your heart.` },
      { title: `Build non-romantic touch`, detail: `Greet friends with a hug. Get a massage. Hold a warm cup of tea with both hands. Your body needs touch even outside romantic relationships.` },
      { title: `Create a daily touch ritual`, detail: `Establish a daily moment of physical connection — a morning hug, a hand-hold before sleep. Ritualised touch ensures the need is met consistently.` },
    ],
  },
  'love-language/gifts': {
    deepDive: [
      "Receiving gifts as your love language means you read love through the thought behind a physical token. It is never about the price — it is about the proof that someone saw you, noticed something, and thought of you. A gift that shows they remembered something you mentioned months ago can make you feel more loved than a grand gesture that required no attention at all.",
      "Your growth edge is learning that people who don't give gifts may still love you deeply — they are just speaking a different language. It's also learning to separate the thought from the object: the most meaningful 'gifts' are sometimes time, attention, or a kind word, even if they don't come in wrapping paper.",
    ],
    actionPlan: [
      { title: `Share your appreciation`, detail: `When someone gives you something, tell them specifically what it meant: "The fact that you remembered I love this makes me feel so seen." Reinforce the behaviour you want more of.` },
      { title: `Give without occasion`, detail: `Surprise someone with a small, thoughtful gift this week — not for a birthday or holiday, just because. Notice how it makes them feel. That is what gifts do for you.` },
      { title: `Reframe other languages as gifts`, detail: `When someone gives you their full attention or helps with a task, tell yourself: "This is their gift to me." Learning to see all love languages as gifts expands how much love you can receive.` },
    ],
  },

  // ── Conflict Style ─────────────────────────────────────────────────────────
  'conflict-style/avoider': {
    deepDive: [
      "As an avoider, your instinct in conflict is to step back, let the heat die down, and process internally before engaging. This is a genuine strength — you rarely escalate, and you give others space. But avoidance has a cost: unspoken tensions accumulate, small issues become resentments, and the people around you may interpret your silence as indifference when it's actually the opposite — you care so much that conflict feels unbearable.",
      "Your growth edge is learning that some tensions need to be named to be healed. Avoiding conflict doesn't preserve peace; it preserves distance. The most connected relationships are not the ones without conflict — they are the ones where both people can disagree, stay present, and come through it together. Your challenge is to bring things up sooner, while they are still small, instead of waiting until they've grown into something harder to address.",
    ],
    actionPlan: [
      { title: `Name one small thing`, detail: `This week, bring up one small thing that is bothering you — before it grows. Start with: "Can I share something that's been on my mind?"` },
      { title: `Set a 24-hour rule`, detail: `When you feel the urge to avoid, give yourself 24 hours to process — then commit to addressing it. The processing time is valid; the permanent silence is not.` },
      { title: `Practice "I" statements`, detail: `Frame concerns as your experience, not their fault: "I feel disconnected when..." is easier to hear than "You never..." It lowers the stakes of speaking up.` },
    ],
  },
  'conflict-style/negotiator': {
    deepDive: [
      "As a negotiator, you approach conflict as a problem to be solved fairly. You are rational under pressure, willing to compromise, and focused on outcomes. This makes you a natural peacemaker. But this pragmatism has a shadow: you may settle for surface-level resolutions that address the practical issue but leave the emotional wound untouched, or you may give ground so quickly that your own needs go unmet.",
      "Your growth edge is learning that not every conflict has a clean middle ground — sometimes the answer isn't compromise but a deeper conversation about what each person truly needs. And sometimes 'winning' the negotiation means losing the relationship. The best resolutions don't just split the difference; they address the real need underneath the stated position.",
    ],
    actionPlan: [
      { title: `Ask "what do you really need?"`, detail: `In your next conflict, before proposing a compromise, ask the other person what they actually need underneath the surface issue. You may find a better solution than splitting the difference.` },
      { title: `Hold your ground once`, detail: `In your next disagreement, identify one thing you will not compromise on. State it clearly. Notice that holding a boundary doesn't end the relationship — it clarifies it.` },
      { title: `Check the emotional layer`, detail: `After resolving a practical issue, ask: "How are we feeling about this now?" If the practical fix didn't address the emotional hurt, you are not done.` },
    ],
  },
  'conflict-style/challenger': {
    deepDive: [
      "As a challenger, you believe the only way through conflict is through it — directly, honestly, and without pretending. You have a low tolerance for things being swept under the rug, and you are often the one brave enough to say what no one else will. This directness is a gift, but it has a cost: you may prioritise truth over timing, and delivery matters as much as content. The right thing said in the wrong way becomes the wrong thing.",
      "Your growth edge is learning that honesty without empathy is just bluntness, and that timing is not a compromise — it is a skill. The most powerful challengers don't just name the truth; they create the conditions where the other person can actually hear it. That sometimes means waiting, softening, or asking permission before delivering a hard truth.",
    ],
    actionPlan: [
      { title: `Ask before you deliver`, detail: `Before your next hard truth, ask: "Can I share something honest with you?" Giving someone the choice to receive it changes how they hear it.` },
      { title: `Watch your tone`, detail: `Record yourself in your next difficult conversation. Listen back. Is your tone matching your intent? Often the message is right but the delivery pushes people away.` },
      { title: `Practice patience`, detail: `When you feel the urge to confront, wait 24 hours. If it still matters, bring it up. If the urgency fades, it was a reaction, not a truth worth speaking.` },
    ],
  },
  'conflict-style/mediator': {
    deepDive: [
      "As a mediator, you have a rare ability to hold space for multiple perspectives and make everyone feel genuinely heard. You care more about understanding than winning, and you naturally see the humanity in each side. This makes you invaluable in conflicts — but it also means your own needs and views can get lost in the process of holding everyone else's.",
      "Your growth edge is learning that being the bridge doesn't mean you don't get to be on a side. You can hold space for others and still advocate for yourself. The most effective mediators know when to step out of the middle and say: 'Here is what I think, and here is what I need.' Your voice matters as much as the voices you are amplifying.",
    ],
    actionPlan: [
      { title: `Take a side once`, detail: `In your next conflict — even someone else's — state your own position clearly. Practice being a participant, not just a facilitator.` },
      { title: `Ask "what do I think?"`, detail: `Before mediating your next conflict, write down your own honest view. You can still hold space for others, but know your own position first.` },
      { title: `Set a boundary on emotional labour`, detail: `Tell the people who bring you their conflicts: "I care about you, but I can't always be the middle. Sometimes I need you to talk to each other directly."` },
    ],
  },

  // ── Energy Source ──────────────────────────────────────────────────────────
  'energy-source/solitude': {
    deepDive: [
      "As an introvert recharger, solitude is not a preference — it is a biological need. Your best thinking, deepest creativity, and most authentic self emerge in quiet, uninterrupted space. But in a world designed for extroverts, you may have internalised the message that needing alone time is a weakness or a sign of anti-social tendencies. It is neither. It is how your nervous system works.",
      "Your growth edge is not learning to be more social — it is learning to protect your solitude unapologetically. The quality of your alone time matters as much as the quantity. Mindless scrolling in a quiet room is not the same as genuine solitude. The most fulfilled introverts don't just carve out time alone; they use it intentionally — for reflection, creativity, and the deep work that only happens in stillness.",
    ],
    actionPlan: [
      { title: `Protect your recharge time`, detail: `Block out daily solitude in your calendar and treat it as non-negotiable. Communicate to others: "This is my quiet time. I'm not available."` },
      { title: `Make solitude intentional`, detail: `For your next alone time, choose one thing: read, write, walk, think. No phone, no scrolling. Quality solitude, not just isolation.` },
      { title: `Design your social energy`, detail: `Plan social interactions with recovery time built in. One evening out = one evening in. Don't stack social commitments back to back.` },
    ],
  },
  'energy-source/social': {
    deepDive: [
      "As a social energiser, you come alive around other people. Conversation, shared laughter, and group energy are not distractions — they are your fuel. You think out loud, feel more yourself in company, and process the world through connection. But this social orientation has a shadow: you may avoid being alone because solitude feels uncomfortable, missing the self-reflection that only happens in stillness.",
      "Your growth edge is learning to be comfortable in your own company. The most socially gifted people are also the ones who can sit with themselves — because the depth they find in solitude makes their connections richer, not poorer. You don't need to become an introvert, but building a relationship with solitude will make you a more grounded, interesting, and emotionally available person in every social setting.",
    ],
    actionPlan: [
      { title: `Practice solo time`, detail: `Spend one evening this week alone — no calls, no texts, no social media. Do something you genuinely enjoy by yourself. Notice what surfaces.` },
      { title: `Diversify your energy sources`, detail: `Identify one non-social activity that energises you — exercise, nature, creativity. Build it into your week so your energy doesn't depend entirely on people.` },
      { title: `Deepen over breadth`, detail: `Instead of many social interactions, invest in one deep conversation this week. Quality connection may energise you more than quantity.` },
    ],
  },
  'energy-source/creative': {
    deepDive: [
      "As a creative flow type, making things is how you breathe. The act of creating — writing, building, designing, cooking, making music — is not just a hobby; it is how you process the world and regulate your nervous system. Flow state is real for you, and nothing compares to the feeling of being fully absorbed in creation. But this orientation has a shadow: you may use creative flow as an escape, losing yourself in projects to avoid difficult emotions or life tasks.",
      "Your growth edge is learning that creativity and structure are not enemies. The most prolific creators don't wait for inspiration — they build systems that make creating inevitable. And the deepest creative work often comes not from escaping life but from engaging with it fully. Your art gets better when your life gets deeper.",
    ],
    actionPlan: [
      { title: `Build a daily creative ritual`, detail: `Set a fixed time each day for creative work — even 20 minutes. Don't wait for inspiration. Show up regardless. Consistency beats intensity.` },
      { title: `Finish one thing`, detail: `Pick one unfinished project and commit to completing it this month. The skill that separates creators from dreamers is finishing.` },
      { title: `Create from life, not from escape`, detail: `Before your next creative session, spend 10 minutes journaling about what is actually happening in your life. Let your real experience fuel your work.` },
    ],
  },
  'energy-source/movement': {
    deepDive: [
      "As a physical mover, your body leads and your mind follows. Movement is not just exercise — it is how you think clearly, regulate your emotions, and feel like yourself. A run clears your head, a workout resets your mood, and physical challenge is where you feel most alive. But this orientation has a shadow: you may use movement to avoid stillness, or push your body so hard that you ignore its signals of fatigue or injury.",
      "Your growth edge is learning that rest is part of training, not the opposite of it. The strongest athletes and the most grounded movers are the ones who know when to stop. And learning to sit still — to process emotions and thoughts without moving through them — will make you not just physically stronger but emotionally deeper.",
    ],
    actionPlan: [
      { title: `Schedule rest as training`, detail: `Treat rest days with the same respect as workout days. Write them in your plan. Recovery is where growth happens.` },
      { title: `Try stillness`, detail: `Spend 10 minutes a day sitting still — no movement, no music. Process what comes up emotionally without moving through it. It will feel uncomfortable; that is the point.` },
      { title: `Listen to your body`, detail: `Before each workout, ask: "What does my body actually need today — intensity or ease?" Honour the answer, even if it is not what you planned.` },
    ],
  },

  // ── Attachment Style (18+) ─────────────────────────────────────────────────
  'attachment-style/secure': {
    deepDive: [
      "Secure attachment is the foundation that makes everything else in intimacy work. You can be emotionally present during sex, ask for what you want, and hold space for your partner's needs without losing yourself. This doesn't mean you never feel insecure — it means you have the tools to navigate those moments without spiralling. Your challenge isn't fixing something broken; it's deepening something that already works.",
      "In long-term relationships, your growth edge is learning that secure attachment can become complacent. The most secure couples aren't the ones who never struggle — they are the ones who keep choosing each other, keep communicating, and keep growing together. Don't take your security for granted. Continue to invest in the relationship, stay curious about your partner, and remember that even secure people need to keep doing the work.",
    ],
    actionPlan: [
      { title: `Keep investing`, detail: `Schedule a weekly check-in with your partner: "How are we? What is working? What needs attention?" Security is maintained, not just achieved.` },
      { title: `Explore together`, detail: `Try something new in your intimacy — a conversation, a fantasy, a new experience. Secure attachment thrives on continued curiosity, not just stability.` },
      { title: `Model for others`, detail: `Your security is a gift. Share what you have learned with friends who struggle in relationships. Your example can be transformative.` },
    ],
  },
  'attachment-style/anxious': {
    deepDive: [
      "Anxious attachment means your nervous system is wired to read every fluctuation in your partner's attention as a signal about the relationship's safety. The highs are electric — when you feel loved, you feel it in every cell. But the silences, the delayed texts, the slight shifts in tone — these can trigger a cascade of fear that feels impossible to control. You may use sex or physical closeness to seek reassurance, agreeing to things to keep your partner happy rather than honouring your own needs.",
      "Your deepest work is not learning to need less — it is learning to trust your own worth independent of your partner's desire for you. The anxiety you feel is not a sign that something is wrong with the relationship; it is a sign that your nervous system learned early that love was conditional or unpredictable. Healing means building an internal sense of safety that doesn't collapse every time the external signal wavers.",
    ],
    actionPlan: [
      { title: `Build internal safety`, detail: `When anxiety spikes, before reaching for your partner, try: 4 slow breaths, name 3 things you can see, remind yourself "I am safe right now." Self-soothe before seeking reassurance.` },
      { title: `Distinguish fear from fact`, detail: `When you feel triggered, write down: "What am I afraid of?" and "What is actually true?" Often the fear is a story, not a fact.` },
      { title: `Honour your needs in bed`, detail: `Next time you feel pressure to agree to something you don't want, practice: "I need to think about that first." Your desires and boundaries matter as much as your partner's.` },
    ],
  },
  'attachment-style/avoidant': {
    deepDive: [
      "Avoidant attachment means you learned early that needing people was risky, so you built a self-sufficient world where emotional dependence feels dangerous. In intimacy, this shows up as a pull toward distance after closeness — not because you don't care, but because closeness triggers a deep, often unconscious fear of being engulfed or let down. You may prefer keeping sex physical rather than emotional, because emotional depth feels like a loss of control.",
      "Your growth edge is not learning to need people more — it is learning that vulnerability doesn't have to cost you your safety. The distance you create to protect yourself is also the distance that keeps you from the connection you secretly crave. Healing means taking small, calculated risks: letting someone see a real feeling, staying present after intimacy instead of withdrawing, and learning that you can be close and still be yourself.",
    ],
    actionPlan: [
      { title: `Stay after closeness`, detail: `After your next intimate moment, resist the urge to withdraw. Stay present for 10 extra minutes. Notice the discomfort — and that you survive it.` },
      { title: `Share one real feeling`, detail: `Tell your partner one thing you are actually feeling this week — not a thought, a feeling. Start small. Vulnerability is a muscle that grows with practice.` },
      { title: `Explore emotional intimacy`, detail: `During your next intimate moment, try keeping eye contact. Let it be emotional, not just physical. The fear you feel is the door, not the wall.` },
    ],
  },
  'attachment-style/disorganized': {
    deepDive: [
      "Disorganized attachment is the most painful pattern to carry — and also one of the most transformable. You want closeness desperately and it terrifies you at the same time. Sex can feel like both a bridge to connection and a source of shame or confusion. Your relationships may swing between intense merging and sudden withdrawal, leaving both you and your partner confused about where you stand.",
      "Your healing path is not about choosing closeness or distance — it is about building the capacity to hold both. This often requires professional support, and that is not a weakness; it is the most courageous thing you can do. The contradiction you feel is not a character flaw; it is a normal response to early experiences where love and danger were mixed together. With self-awareness and the right support, you can build a secure-enough base that allows for the connection you want without the terror that has kept you from it.",
    ],
    actionPlan: [
      { title: `Seek professional support`, detail: `Consider a therapist who specialises in attachment or trauma. This pattern is hard to untangle alone, and that is okay. Healing is not a solo sport.` },
      { title: `Name the swing`, detail: `When you feel the urge to withdraw after closeness, say to yourself: "This is my pattern, not the truth." Naming it gives you a moment of choice before acting on it.` },
      { title: `Communicate the pattern`, detail: `Tell a trusted partner: "Sometimes I pull away after feeling close. It is not about you — it is my fear. If I go quiet, please ask me what I am feeling." Giving them a map helps them stay.` },
    ],
  },

  // ── Desire Style (18+) ─────────────────────────────────────────────────────
  'desire-style/spontaneous': {
    deepDive: [
      "Spontaneous desire means your sexual desire arrives without needing context — it just shows up, often at inconvenient times. This is a genuine asset: you bring passion, initiative, and a sexual energy that can be electric. But in long-term relationships, you may interpret a partner's lower or more responsive desire as rejection, when it is simply a different pattern of arousal.",
      "Your growth edge is learning that desire mismatch is not a sign of a failing relationship — it is a normal difference between bodies. The key is communication: understanding your partner's desire pattern, not taking it personally, and finding ways to bridge the gap that honour both of you. Your spontaneous energy is most powerful when it is paired with patience and curiosity about your partner's different rhythm.",
    ],
    actionPlan: [
      { title: `Learn their pattern`, detail: `Ask your partner: "What helps you feel desire?" Listen without defending. Their answer is a map, not a criticism of your approach.` },
      { title: `Don't take it personally`, detail: `When your partner isn't in the mood, remind yourself: "This is about their body, not my desirability." Rejection of sex is not rejection of you.` },
      { title: `Channel the energy`, detail: `When desire hits and your partner isn't available, explore solo. Your sexuality is yours — it doesn't require a partner to be valid or fulfilling.` },
    ],
  },
  'desire-style/responsive': {
    deepDive: [
      "Responsive desire means your desire wakes up when conditions are right — emotional safety, connection, and the right context. This is not low libido; it is context-dependent desire. You are not broken, and you are not less sexual than someone with spontaneous desire. You simply need a different kind of kindling for the fire to catch.",
      "Your growth edge is learning to communicate what those conditions are — because your partner likely cannot guess. The most fulfilling sex for you starts long before the bedroom: a meaningful conversation, a moment of emotional connection, feeling seen and desired. Naming what you need is not demanding; it is giving your partner the recipe for your desire.",
    ],
    actionPlan: [
      { title: `Map your desire conditions`, detail: `Write down: what makes you feel most open to sex? Emotional connection? Feeling desired? A specific atmosphere? Share this with your partner.` },
      { title: `Build the bridge`, detail: `Ask your partner to invest in the conditions that open you up — a real conversation, a slow evening, physical affection without expectation. Foreplay starts with connection.` },
      { title: `Release the pressure`, detail: `Tell your partner: "Sometimes I need time to warm up. That doesn't mean I don't want you — it means my body needs a runway." Removing pressure often makes desire arrive faster.` },
    ],
  },
  'desire-style/sensual': {
    deepDive: [
      "Sensual desire means your whole body is involved in sex. Touch, scent, sound, atmosphere — these aren't extras; they are the experience. You are turned on by slow builds, extended foreplay, and the kind of attention that treats every part of your body as worth exploring. You want to be fully present in your body, not rushing toward an endpoint.",
      "Your growth edge is learning to ask for the kind of sex you want without feeling like it is 'too much' or 'too slow.' Many partners default to a faster, more goal-oriented pace. Your sensuality is not a complication — it is an invitation to a deeper, more full-bodied experience that most people crave but don't know how to ask for. Naming what you want gives your partner permission to slow down too.",
    ],
    actionPlan: [
      { title: `Set the scene`, detail: `Before your next intimate moment, create the atmosphere you crave — lighting, music, scent. Tell your partner: "This is what helps me feel most present."` },
      { title: `Ask for slowness`, detail: `Tell your partner: "I want to feel every moment. Can we go twice as slow as usual?" Naming the pace you want transforms the experience.` },
      { title: `Explore full-body touch`, detail: `Ask for touch that isn't goal-oriented — a massage, skin-to-skin closeness, with no expectation of where it goes. Sensual desire thrives in touch without pressure.` },
    ],
  },
  'desire-style/experimental': {
    deepDive: [
      "Experimental desire means novelty is your greatest turn-on. You are genuinely excited by exploring kinks, fantasies, power dynamics, and scenarios that sit outside the ordinary. Routine kills your drive; novelty resurrects it. This is a beautiful sexual orientation — but it comes with the responsibility of exploring ethically, communicating clearly, and ensuring that your desire for the new doesn't come at the cost of your partner's comfort.",
      "Your growth edge is learning that experimentation works best on a foundation of trust. The most adventurous couples aren't the ones who do the most extreme things — they are the ones who communicate so well that anything feels safe to explore. Before pushing boundaries, build the communication infrastructure that makes exploration feel like an adventure you are on together, not a pressure one of you is under.",
    ],
    actionPlan: [
      { title: `Negotiate before you explore`, detail: `Before trying something new, have an honest conversation: "I am curious about [X]. How do you feel about that? What are your boundaries?" Enthusiastic consent makes exploration hot, not heavy.` },
      { title: `Build trust first`, detail: `The more adventurous you want to be, the more you need to invest in emotional safety outside the bedroom. Trust is the foundation that makes risk feel exciting instead of scary.` },
      { title: `Debrief after`, detail: `After exploring something new, check in: "How was that for you? What worked? What didn't?" Post-experiment conversations deepen intimacy and make the next adventure better.` },
    ],
  },

  // ── Sex Communication (18+) ────────────────────────────────────────────────
  'sex-communication/direct': {
    deepDive: [
      "As a direct communicator, you have no problem naming your desires, limits, and needs out loud. This is a rare and genuinely valuable quality — people always know where they stand with you, and that clarity creates safety. But directness has a shadow: you may confuse being honest with being blunt, or you may push past a partner's need for a softer approach because your comfort with explicitness is not universal.",
      "Your growth edge is learning that different people need different on-ramps to sexual conversations. What feels natural and easy to you — saying exactly what you want in the moment — may feel terrifying to a partner who needs more emotional safety first. The most powerful direct communicators don't just speak clearly; they read the room and adjust their delivery to make their honesty land.",
    ],
    actionPlan: [
      { title: `Read the room`, detail: `Before your next direct sexual conversation, ask: "Is this a good time to talk about this?" Giving someone the choice to receive your honesty changes how it lands.` },
      { title: `Soften the entry`, detail: `Try starting with: "I have been thinking about something I would love to try..." instead of leading with the explicit request. A softer opening helps a less direct partner stay present.` },
      { title: `Ask about their style`, detail: `Ask your partner: "How do you prefer to talk about sex? What makes it easier for you?" Their answer will make your directness more effective, not less.` },
    ],
  },
  'sex-communication/open': {
    deepDive: [
      "As an open sharer, you build intimacy through honest conversation about sex and desire. You are emotionally fluent, willing to have the slightly uncomfortable conversations, and you understand that emotional openness and sexual openness feed each other. This is a genuine strength — but it has a shadow: you may assume that talking about sex is the same as having good sex, or that your comfort with conversation means your partner feels the same way.",
      "Your growth edge is learning that not everyone processes sex through conversation. Some partners communicate through touch, through showing rather than telling, or through what they do in the moment. Your openness is most powerful when paired with curiosity about your partner's different communication style — and when you remember that sometimes the best sexual communication happens without words.",
    ],
    actionPlan: [
      { title: `Ask, don't assume`, detail: `Ask your partner: "How do you prefer to communicate about sex — through words, through touch, or in the moment?" Their answer may surprise you.` },
      { title: `Leave space for silence`, detail: `After sharing something about your sexual desires, give your partner time to process. Don't fill the silence. Their response may come in actions, not words.` },
      { title: `Match talk with action`, detail: `After a good conversation about sex, make sure you follow through in the bedroom. Talking about desire is the appetiser; acting on it is the meal.` },
    ],
  },
  'sex-communication/physical': {
    deepDive: [
      "As a physical communicator, your body speaks louder than your words. You redirect, express desire, and build intimacy through touch, movement, and response rather than verbal conversation. This is deeply intuitive and powerful — but it has a real limitation: some things — boundaries, shifting needs, emotional states — are hard to communicate without words, and your partner may misread your physical cues or miss something you never said.",
      "Your growth edge is learning that some conversations need words, even if they feel awkward. The most physically attuned lovers are also the ones who can name a boundary, check in verbally, and say out loud when something isn't working. Adding words to your physical vocabulary doesn't replace your intuition — it makes it safer and clearer for both of you.",
    ],
    actionPlan: [
      { title: `Add one verbal check-in`, detail: `During your next intimate moment, ask one simple question: "Does this feel good?" Two words. That is all it takes to add verbal communication to your physical fluency.` },
      { title: `Name a boundary`, detail: `Before your next intimate encounter, say one thing you don't want: "I am not in the mood for [X] tonight." Verbal boundaries are clearer than physical redirection.` },
      { title: `Debrief with words`, detail: `After sex, try one sentence: "That was [how it felt]." Building a small verbal vocabulary around sex will make your physical communication even more effective.` },
    ],
  },
  'sex-communication/guarded': {
    deepDive: [
      "As a guarded opener, talking about sex openly is genuinely hard for you — not because you have nothing to say, but because exposing your desires and limits feels deeply vulnerable. You may have learned that expressing sexual needs leads to judgment, rejection, or disappointment. The result is that you often go unmet or settle for less than you want, rather than risking the discomfort of asking.",
      "Your growth edge is not learning to be loud — it is learning that your needs are worth the small risk of saying them out loud. You don't have to become a direct communicator overnight. Start with one small, honest sentence. Each time you name a desire or a boundary and the world doesn't end, your nervous system learns that it is safe to speak. The partner who deserves you is one who makes that speaking feel welcomed, not judged.",
    ],
    actionPlan: [
      { title: `Start with one sentence`, detail: `Before your next intimate moment, say one thing you want: "I would love it if you [specific thing]." One sentence. That is enough to begin.` },
      { title: `Write it first`, detail: `If saying it out loud feels impossible, write it down and share it — a text, a note. Written words can be a bridge to spoken ones.` },
      { title: `Choose a safe partner`, detail: `Practice this with someone who responds to your vulnerability with warmth, not pressure. The right person makes speaking up feel safe, not scary.` },
    ],
  },

  // ── Love or Pressure (Pro) ─────────────────────────────────────────────────
  'love-or-pressure/healthy': {
    deepDive: [
      "A healthy connection is one where both people feel more like themselves, not less. Your answers suggest this relationship gives more than it takes — there is mutual respect, real communication, and the freedom to be honest without fear. This doesn't mean the relationship is perfect; it means the foundation is sound enough that challenges become opportunities to grow closer, not threats to the bond.",
      "The work now is not to fix something broken but to protect and deepen what is working. Healthy relationships don't stay healthy by accident — they stay healthy because both people keep choosing each other, keep communicating, and keep investing. Continue to nurture this connection, stay curious about each other, and don't take the health for granted.",
    ],
    actionPlan: [
      { title: `Name what is working`, detail: `Tell your partner specifically what you appreciate about the relationship. Gratitude spoken aloud strengthens the foundation.` },
      { title: `Keep growing together`, detail: `Try something new together — a challenge, a trip, a shared goal. Growth keeps healthy relationships from becoming stagnant.` },
      { title: `Check in regularly`, detail: `Establish a monthly ritual: "How are we? What could be better?" Healthy couples don't wait for problems; they prevent them.` },
    ],
  },
  'love-or-pressure/pressure': {
    deepDive: [
      "Your answers suggest this relationship has elements of pressure — not necessarily manipulation, but a dynamic where you frequently adjust yourself to keep the peace. You may find yourself weighing your words, apologising first to restore calm, or deferring to avoid conflict. This doesn't mean the relationship is toxic, but it does mean the balance has tilted in a way that is costing you your full self.",
      "The question to sit with is: are you shrinking to fit this relationship, or are you growing in it? A relationship with pressure can sometimes be recalibrated through honest conversation and boundary-setting — but only if both people are willing to look at the dynamic. If you have tried to raise this and been dismissed, that is important information. You deserve a relationship where you don't have to manage someone else's emotions to feel safe.",
    ],
    actionPlan: [
      { title: `Name the pattern`, detail: `Tell your partner: "I have noticed I often change what I want to avoid conflict. I want to work on being more honest, even when it is uncomfortable." Their response will tell you a lot.` },
      { title: `Hold one boundary`, detail: `This week, say no to one thing you would normally agree to just to keep the peace. Notice what happens. A healthy partner respects a boundary; a pressuring one pushes back.` },
      { title: `Talk to someone`, detail: `Share what you are experiencing with a trusted friend or therapist. An outside perspective can help you see the dynamic more clearly.` },
    ],
  },
  'love-or-pressure/manipulation': {
    deepDive: [
      "Your answers suggest this relationship may have patterns of manipulation — a dynamic where your sense of self, your decisions, and your emotional reality are being shaped by someone else's needs in ways that are not healthy. You may find yourself apologising for things you didn't do, managing their emotions before your own, or feeling relief at the thought of the relationship ending. These are significant signals.",
      "This is hard to hear, but it is important: a relationship with manipulation rarely gets better without significant change, and that change usually requires the manipulating person to take real responsibility — which is uncommon. Your first priority is not fixing the relationship; it is protecting yourself. Consider professional support to help you see the dynamic clearly and make decisions from a place of strength, not fear.",
    ],
    actionPlan: [
      { title: `Reach out for support`, detail: `Contact a therapist or a domestic abuse helpline. You don't have to be in physical danger to deserve support. Emotional manipulation is real and help is available.` },
      { title: `Reconnect with yourself`, detail: `Spend time apart from this person. Ask: "Who am I when I am not managing this relationship?" Rebuilding your sense of self is the first step.` },
      { title: `Tell someone`, detail: `Share what is happening with a trusted friend or family member. Secrecy protects the dynamic; truth breaks it. You don't have to carry this alone.` },
    ],
  },

  // ── Boundary Strength (Pro) ─────────────────────────────────────────────────
  'boundary-strength/firm': {
    deepDive: [
      "Firm boundaries mean you have a clear sense of where you end and others begin. You can say no without guilt, protect your time and energy, and hold your limits even when it disappoints people. This is a genuine strength — but it has a shadow: firmness can become rigidity, and walls that protect you can also isolate you if they never come down.",
      "Your growth edge is learning the difference between a boundary and a wall. Boundaries have gates — they let the right people in and keep the wrong behaviour out. Walls keep everything out. The most boundary-secure people are not the most guarded; they are the most discerning. They know when to hold firm and when to open, and they can let someone close without losing themselves.",
    ],
    actionPlan: [
      { title: `Check for walls`, detail: `Ask yourself: "Is there anyone I have shut out who I actually want closer?" If so, consider what would need to be true for you to open the gate. Boundaries can be permeable.` },
      { title: `Practice flexibility`, detail: `This week, say yes to one thing you would normally decline — not because you should, but to notice that flexibility doesn't have to mean losing yourself.` },
      { title: `Communicate your boundaries warmly`, detail: `When you hold a limit, try: "I care about you, and I need [X]." Warm firmness invites respect; cold firmness invites distance.` },
    ],
  },
  'boundary-strength/growing': {
    deepDive: [
      "Growing boundaries mean you are in the process of learning where your edges are. You can sometimes say no, sometimes hold your ground — but you also find yourself over-giving, people-pleasing, or agreeing to things you later regret. This is not a failure; it is a stage of development. Boundary-setting is a skill, and you are building it.",
      "Your growth edge is learning that boundaries are not selfish — they are the structure that makes generosity sustainable. Every time you say yes when you mean no, you build resentment that eventually leaks out. The most loving thing you can do for your relationships is to be honest about your limits, because it allows people to love the real you, not the accommodating version.",
    ],
    actionPlan: [
      { title: `Practice "let me think about it"`, detail: `When asked for something, stop saying yes immediately. Try: "Let me get back to you." This buys you time to check what you actually want.` },
      { title: `Say no to one small thing`, detail: `This week, decline one small request you would normally accept out of habit. Start small. Each no builds the muscle for the bigger ones.` },
      { title: `Track your yeses`, detail: `For one week, note every time you say yes when you mean no. Patterns will emerge. Awareness is the first step to change.` },
    ],
  },
  'boundary-strength/pleasing': {
    deepDive: [
      "People-pleasing boundaries mean you have learned to prioritise others' comfort over your own needs. You may say yes when you mean no, apologise for things that aren't your fault, or shape yourself around what others want until you lose track of what you want. This often comes from a good place — you care deeply — but it has a cost: chronic over-giving leads to resentment, burnout, and relationships where you feel unseen.",
      "Your deepest work is learning that your needs matter, and that saying no is not a rejection of others — it is a commitment to yourself. The people who love you for who you are, not for what you do for them, will respect your boundaries. The ones who don't are the ones your boundaries are for. This will feel uncomfortable at first. That discomfort is growth, not a sign you are doing something wrong.",
    ],
    actionPlan: [
      { title: `Start with one no`, detail: `This week, say no to one request — big or small. "I can't do that right now." No explanation needed. Notice the world doesn't end.` },
      { title: `Ask "what do I want?"`, detail: `Before responding to any request this week, pause and ask yourself: "What do I actually want?" Then let your answer reflect that, not what you think they want to hear.` },
      { title: `Let someone be disappointed`, detail: `Set a boundary that you know will disappoint someone. Sit with their disappointment without fixing it. Their feelings are theirs to manage, not yours to prevent.` },
    ],
  },

  // ── Perspective Shift (Pro) ────────────────────────────────────────────────
  'perspective-shift/clear': {
    deepDive: [
      "A clear perspective means you can see your life with remarkable honesty. You understand your emotions, recognise your patterns, and have a grounded sense of what is working and what isn't. This clarity is a hard-won achievement — most people live in some degree of self-deception, and you have done the work to see clearly.",
      "Your growth edge is not gaining more clarity — it is acting on the clarity you already have. Sometimes the clearest vision comes with the most resistance to change, because you can see exactly what needs to shift and that seeing can be overwhelming. The next step is not more insight; it is courageous action based on the insight you already hold.",
    ],
    actionPlan: [
      { title: `Act on one insight`, detail: `Identify one thing you see clearly but haven't acted on. Take one concrete step toward it this week. Clarity without action is just observation.` },
      { title: `Share your clarity`, detail: `Tell someone you trust what you see in your life right now. Speaking clarity aloud makes it more real and creates accountability.` },
      { title: `Trust the knowing`, detail: `When you feel clear about a decision, stop second-guessing. Act. You have earned the right to trust your own clarity.` },
    ],
  },
  'perspective-shift/emotional': {
    deepDive: [
      "An emotional perspective means your view of your life is filtered through your current emotional state. When you feel good, things look manageable; when you feel low, everything looks hopeless. This is not a flaw — it is how most humans process reality. But it means your perspective is unstable, shifting with your mood rather than reflecting a steady truth.",
      "Your growth edge is learning to distinguish between how you feel about your life and what is actually true about your life. These are often different things. The practice is to notice when your emotions are colouring your perspective, name it — \"I am feeling hopeless right now, but that doesn't mean things are hopeless\" — and wait for the emotional weather to pass before making big decisions.",
    ],
    actionPlan: [
      { title: `Wait 48 hours`, detail: `Before making any major decision driven by a strong emotion, wait 48 hours. If it still feels right when the emotion has settled, act.` },
      { title: `Separate feeling from fact`, detail: `When you feel overwhelmed, write two columns: "How I feel" and "What is actually true." The gap between them is where your perspective gets distorted.` },
      { title: `Track the pattern`, detail: `For two weeks, note your mood and your life outlook each day. You will see that your perspective shifts with your emotions — and that neither state is permanent.` },
    ],
  },
  'perspective-shift/foggy': {
    deepDive: [
      "A foggy perspective means you are in a period where the path forward isn't clear. You may feel disconnected from your own desires, uncertain about what matters, or numb to your own emotional signals. This is not a failure — it is a normal human experience, often a sign that something old is ending and something new hasn't emerged yet. The fog is the space in between.",
      "Your growth edge is learning that clarity doesn't come from thinking harder — it comes from living forward. When the fog is thick, the answer is not more analysis; it is action. Small experiments, new experiences, and honest conversations will create the data that eventually clears the fog. You don't need to see the whole path — you need to see the next step.",
    ],
    actionPlan: [
      { title: `Take one small step`, detail: `Don't try to figure out the whole path. Identify one small action that feels slightly right and take it this week. The next step becomes visible only after you take this one.` },
      { title: `Stop analysing, start experiencing`, detail: `For one week, when you feel stuck in your head, do something physical — walk, cook, create. The body often knows before the mind does.` },
      { title: `Talk to someone`, detail: `Share your fog with someone you trust. Sometimes clarity comes not from finding the answer yourself but from letting someone else reflect you back to yourself.` },
    ],
  },
}

// Helper: get the deep report for a specific quiz result
export function getDeepReport(quizId: string, resultTypeId: string): DeepReport | null {
  return deepReports[`${quizId}/${resultTypeId}`] ?? null
}
