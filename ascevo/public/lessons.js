
// ------------------------------
// 🧠 MENTAL HEALTH LESSONS
// ------------------------------
const mentalHealthLessons = [
  // UNIT 1: Understanding Your Mind
  {
    id: "mh-1",
    title: "What Is Anxiety?",
    unit: 1,
    unitName: "Understanding Your Mind",
    exercises: [
      { type: "multiple-choice", question: "Anxiety is best described as...", options: ["A sign of weakness", "Your brain's alarm system firing", "Something only some people feel", "A mental illness"], correct: 1, explanation: "Anxiety is a survival mechanism — it evolved to protect you. Everyone feels it." },
      { type: "true-false", statement: "Anxiety always means something bad is about to happen.", correct: false, explanation: "Anxiety often fires as a false alarm. Your brain can't always tell the difference between real and imagined threats." },
      { type: "fill-blank", question: "The fight-or-flight response releases _______ into your bloodstream.", correct: ["adrenaline", "cortisol", "stress hormones"], explanation: "Adrenaline prepares your body to fight or flee — useful in real danger, uncomfortable in a meeting." },
      { type: "scenario", question: "You have a big presentation tomorrow and can't sleep. You feel your heart racing. What's actually happening?", options: ["You're having a panic attack and should call a doctor", "Your brain is overestimating the threat — this is normal anxiety", "You're not prepared enough"], correct: 1, explanation: "Your brain is trying to keep you safe, even when there's no real danger." },
      { type: "reflection", question: "Describe a recent moment when you felt anxious. What triggered it?", minChars: 50, explanation: "Naming triggers helps you notice patterns and respond, not react." },
      { type: "reorder", question: "Put the anxiety cycle in order:", items: ["Body reacts", "You feel relief", "Trigger occurs", "You avoid the situation"], correctOrder: [2, 0, 3, 1], explanation: "Anxiety cycles: trigger → body reacts → avoid → relief, which makes avoidance stronger next time." }
    ]
  },
  {
    id: "mh-2",
    title: "The Stress Response",
    unit: 1,
    unitName: "Understanding Your Mind",
    exercises: [
      { type: "multiple-choice", question: "What hormone is released during stress?", options: ["Melatonin", "Cortisol", "Insulin", "Estrogen"], correct: 1, explanation: "Cortisol increases glucose in the bloodstream to give you energy for fight or flight." },
      { type: "reorder", question: "Order the stress response stages:", items: ["Resistance", "Exhaustion", "Alarm"], correctOrder: [2, 0, 1], explanation: "The 3 stages of stress: alarm (initial shock), resistance (coping), exhaustion (recovery needed)." },
      { type: "true-false", statement: "Stress is always bad for you.", correct: false, explanation: "Eustress (positive stress) motivates growth — it's about intensity and duration." },
      { type: "scenario", question: "You've been working 12-hour days for a month and feel tired, irritable, and can't focus. What's happening?", options: ["You're just lazy", "Your body is in the exhaustion stage of stress", "You need a vacation immediately"], correct: 1, explanation: "Chronic stress depletes resources — your body is telling you to pause." },
      { type: "fill-blank", question: "_______ stress is short-term and motivating.", correct: ["acute", "short", "positive"], explanation: "Acute stress helps you perform — it's the energy you feel before a presentation." },
      { type: "reflection", question: "What does stress feel like in your body? Describe the physical sensations.", minChars: 50, explanation: "Body awareness is the first step in managing stress." }
    ]
  },
  {
    id: "mh-3",
    title: "Emotions Are Data",
    unit: 1,
    unitName: "Understanding Your Mind",
    exercises: [
      { type: "multiple-choice", question: "Emotions are signals, not _______.", options: ["permanent", "facts", "bad", "important"], correct: 1, explanation: "Emotions tell you what matters; they aren't reality itself." },
      { type: "true-false", statement: "You should always trust your first emotional reaction.", correct: false, explanation: "First reactions are often automatic — pause to reflect before acting." },
      { type: "scenario", question: "Your friend cancels plans last minute and you feel anger rise. What does this emotion tell you?", options: ["Your friend is selfish", "You value their time and connection", "You need new friends"], correct: 1, explanation: "Anger here signals unmet needs for predictability or closeness." },
      { type: "reorder", question: "Order the steps for processing emotions:", items: ["Act wisely", "Feel the sensation", "Name the emotion", "Pause"], correctOrder: [3, 1, 2, 0], explanation: "Pause → feel → name → respond thoughtfully." },
      { type: "fill-blank", question: "_______ your emotions makes them less intense.", correct: ["naming", "labeling", "identifying"], explanation: "Putting feelings into words reduces amygdala activity." },
      { type: "reflection", question: "What's an emotion you've been feeling a lot lately? What do you think it's trying to tell you?", minChars: 50, explanation: "Listening to emotions builds emotional intelligence." }
    ]
  },
  // UNIT 2: Calming Techniques
  {
    id: "mh-4",
    title: "Box Breathing",
    unit: 2,
    unitName: "Calming Techniques",
    exercises: [
      { type: "multiple-choice", question: "Box breathing has how many steps?", options: ["2", "3", "4", "5"], correct: 2, explanation: "Inhale → hold → exhale → hold, each 4 seconds." },
      { type: "reorder", question: "Order the box breathing steps:", items: ["Exhale 4s", "Hold 4s", "Inhale 4s"], correctOrder: [2, 1, 0, 1], explanation: "Inhale (4) → Hold (4) → Exhale (4) → Hold (4), repeat." },
      { type: "true-false", statement: "Box breathing works by activating your parasympathetic nervous system.", correct: true, explanation: "Controlled breathing stimulates the vagus nerve, calming your body." },
      { type: "scenario", question: "You're feeling overwhelmed in a meeting. What's a discreet way to use box breathing?", options: ["Excuse yourself and do it in the bathroom", "Breathe slowly in time with your notes", "Tap your foot rapidly", "Hold your breath until calm"], correct: 1, explanation: "Slow, controlled breathing can be done quietly without anyone noticing." },
      { type: "fill-blank", question: "The ideal duration for each step in box breathing is _______ seconds.", correct: ["4", "four"], explanation: "4 seconds per step creates a square/box rhythm." },
      { type: "reflection", question: "Try box breathing right now for 3 rounds. How did your body feel afterward?", minChars: 50, explanation: "Practicing builds the skill so it's available when you need it." }
    ]
  },
  {
    id: "mh-5",
    title: "The 5-4-3-2-1 Method",
    unit: 2,
    unitName: "Calming Techniques",
    exercises: [
      { type: "multiple-choice", question: "What sense does 5-4-3-2-1 use first?", options: ["Hear", "See", "Touch", "Taste"], correct: 1, explanation: "5 things you can see, 4 feel, 3 hear, 2 smell, 1 taste." },
      { type: "reorder", question: "Order the 5-4-3-2-1 steps:", items: ["Smell 2 things", "Hear 3 things", "See 5 things", "Taste 1 thing", "Touch 4 things"], correctOrder: [2, 4, 1, 0, 3], explanation: "See 5, touch 4, hear 3, smell 2, taste 1." },
      { type: "true-false", statement: "The 5-4-3-2-1 method works by grounding you in the present.", correct: true, explanation: "Using your senses yanks you out of ruminating about past/future into now." },
      { type: "scenario", question: "You're spiraling about a work email. What's the first 5-4-3-2-1 step?", options: ["Close your eyes and meditate", "Look around and name 5 visible things", "Call a friend", "Delete the email"], correct: 1, explanation: "Naming things you see immediately grounds your attention." },
      { type: "fill-blank", question: "5-4-3-2-1 is called a _______ technique.", correct: ["grounding", "sensory", "present"], explanation: "It grounds you in your immediate sensory experience." },
      { type: "reflection", question: "List your current 5-4-3-2-1 right now. What's something you noticed for the first time?", minChars: 50, explanation: "This skill gets stronger with practice — your brain gets better at noticing details." }
    ]
  },
  {
    id: "mh-6",
    title: "Progressive Muscle Relaxation",
    unit: 2,
    unitName: "Calming Techniques",
    exercises: [
      { type: "multiple-choice", question: "PMR involves tensing and _______ muscles.", options: ["stretching", "relaxing", "strengthening", "massaging"], correct: 1, explanation: "Tense (5-10s) then release (20s), noticing the difference." },
      { type: "true-false", statement: "PMR works because it builds physical tension first.", correct: true, explanation: "Contrast makes relaxation deeper — you feel the difference between tense and loose." },
      { type: "reorder", question: "Order typical PMR muscle groups (top to bottom):", items: ["Feet", "Hands", "Shoulders", "Face"], correctOrder: [3, 2, 1, 0], explanation: "Start at face/head and work your way down to feet." },
      { type: "scenario", question: "You have 5 minutes before bed and your body feels tight. What's the best PMR approach?", options: ["Full 20-minute PMR", "Quick scan: tense/release just your main tension areas", "No relaxation needed", "Drink coffee first"], correct: 1, explanation: "Even 2-3 muscle groups make a difference for sleep." },
      { type: "fill-blank", question: "When releasing tension in PMR, imagine _______ melting.", correct: ["tension", "stress", "tightness", "knots"], explanation: "Visualization enhances the relaxation response." },
      { type: "reflection", question: "What's your most tense muscle group? Try tensing/releasing it now. How does it feel?", minChars: 50, explanation: "Mapping your tension spots helps you intervene faster next time." }
    ]
  },
  // UNIT 3: Thinking Patterns
  {
    id: "mh-7",
    title: "Cognitive Distortions",
    unit: 3,
    unitName: "Thinking Patterns",
    exercises: [
      { type: "multiple-choice", question: "Black-or-white thinking is also called...", options: ["all-or-nothing", "mind-reading", "fortune-telling", "catastrophizing"], correct: 0, explanation: "All-or-nothing thinking ignores the middle ground between extremes." },
      { type: "true-false", statement: "Cognitive distortions are always true.", correct: false, explanation: "Distortions are thinking traps — they feel true, but aren't accurate." },
      { type: "scenario", question: "You make one mistake at work and think, 'I'm going to get fired.' What distortion is this?", options: ["All-or-nothing", "Catastrophizing", "Mind-reading", "Discounting positives"], correct: 1, explanation: "Catastrophizing assumes the worst possible outcome." },
      { type: "reorder", question: "Order the steps for challenging a distortion:", items: ["Find evidence", "Name the distortion", "Ask 'Is this 100% true?'", "Form a balanced thought"], correctOrder: [1, 2, 0, 3], explanation: "Name → question → find evidence → balance." },
      { type: "fill-blank", question: "_______ distortion assumes you know what others are thinking.", correct: ["mind-reading", "mind reading"], explanation: "Mind-reading: 'They probably hate me' without evidence." },
      { type: "reflection", question: "What's a distorted thought you've had this week? What's a more balanced way to look at it?", minChars: 50, explanation: "Challenging distortions creates flexibility in thinking." }
    ]
  },
  {
    id: "mh-8",
    title: "Reframing Negative Thoughts",
    unit: 3,
    unitName: "Thinking Patterns",
    exercises: [
      { type: "multiple-choice", question: "Reframing means...", options: ["Ignoring reality", "Changing how you interpret the same situation", "Lying to yourself", "Only seeing the positive"], correct: 1, explanation: "Reframing keeps facts but shifts perspective — it's honest." },
      { type: "true-false", statement: "Reframing requires optimism.", correct: false, explanation: "Reframing requires accuracy — balanced, not necessarily positive." },
      { type: "scenario", question: "Original thought: 'My friend didn't text back, they hate me!' What's a good reframe?", options: ["They definitely hate me, I should never talk to them again", "They might be busy, or just forgot — I can ask later", "I'm a terrible friend", "I should text 10 more times to make sure"], correct: 1, explanation: "Reframes give alternative possibilities without assuming the worst." },
      { type: "reorder", question: "Order the reframing steps:", items: ["Generate alternatives", "Notice the thought", "Pick the most useful one", "Check evidence"], correctOrder: [1, 3, 0, 2], explanation: "Notice → check evidence → alternatives → choose." },
      { type: "fill-blank", question: "A good reframe is based on _______, not wishful thinking.", correct: ["facts", "evidence", "reality"], explanation: "Reframes are grounded in what's actually true." },
      { type: "reflection", question: "Take a recent negative thought and reframe it. How does the new thought make you feel?", minChars: 50, explanation: "Practice rewires your brain to default to more balanced interpretations." }
    ]
  },
  {
    id: "mh-9",
    title: "The Inner Critic",
    unit: 3,
    unitName: "Thinking Patterns",
    exercises: [
      { type: "multiple-choice", question: "Your inner critic often sounds like...", options: ["Your best friend", "A supportive mentor", "A past authority figure or bully", "A rational advisor"], correct: 2, explanation: "Inner critics often adopt voices from childhood or past critiques." },
      { type: "true-false", statement: "Your inner critic is trying to hurt you.", correct: false, explanation: "Critics are usually trying to protect you (e.g., from failure) — just badly." },
      { type: "scenario", question: "Your inner critic says, 'You're so stupid for messing that up.' What's a compassionate response?", options: ["You're right, I am", "That's not helpful. I tried my best, and I can learn from this", "Ignore it completely", "Argue with it back"], correct: 1, explanation: "Compassionate responses don't attack back — they offer understanding." },
      { type: "reorder", question: "Order steps for working with inner critic:", items: ["Speak back compassionately", "Name it", "Thank it for trying", "Notice it"], correctOrder: [3, 1, 2, 0], explanation: "Notice → name → thank for intent → respond kindly." },
      { type: "fill-blank", question: "Talk to yourself like you'd talk to a good _______.", correct: ["friend", "pal", "companion"], explanation: "Self-compassion uses the same kindness we give others." },
      { type: "reflection", question: "What does your inner critic usually say? Imagine saying it to a friend — how does that feel?", minChars: 50, explanation: "This perspective shift makes the critic's absurdity obvious." }
    ]
  },
  // UNIT 4: Building Resilience
  {
    id: "mh-10",
    title: "What Resilience Actually Is",
    unit: 4,
    unitName: "Building Resilience",
    exercises: [
      { type: "multiple-choice", question: "Resilience means...", options: ["Never feeling negative emotions", "Bouncing back from difficulties", "Being perfect", "Avoiding all problems"], correct: 1, explanation: "Resilience is about recovery, not immunity to pain." },
      { type: "true-false", statement: "Resilience is a fixed trait you're born with.", correct: false, explanation: "Resilience is a set of skills that can be learned and strengthened." },
      { type: "scenario", question: "You fail an important test. What's a resilient response?", options: ["Quit forever", 'Study differently next time and ask for help', "I'm just not smart enough", "Blame the teacher"], correct: 1, explanation: "Resilience focuses on growth and control, not defeat." },
      { type: "reorder", question: "Order the building blocks of resilience:", items: ["Connection", "Purpose", "Health", "Self-awareness"], correctOrder: [3, 0, 1, 2], explanation: "Self-awareness → connection → purpose → health." },
      { type: "fill-blank", question: "Resilience is about _______, not perfection.", correct: ["progress", "growth", "bouncing back", "recovery"], explanation: "It's not about never falling — it's about how you get up." },
      { type: "reflection", question: "What's a time you bounced back from something hard? What helped you?", minChars: 50, explanation: "Recalling past resilience builds confidence you can do it again." }
    ]
  },
  {
    id: "mh-11",
    title: "Bouncing Back From Failure",
    unit: 4,
    unitName: "Building Resilience",
    exercises: [
      { type: "multiple-choice", question: "Failure is best seen as...", options: ["The end", "Proof you're not good enough", "Data and feedback", "Something to hide"], correct: 2, explanation: "Failure tells you what needs adjusting — it's information, not identity." },
      { type: "true-false", statement: "Successful people never fail.", correct: false, explanation: "Success stories are mostly stories of persistence after failure." },
      { type: "scenario", question: "You pitch an idea and it gets rejected. What's the best next step?", options: ["Never pitch again", "Ask for specific feedback and iterate", "Badmouth the people who rejected you", "Give up on ideas entirely"], correct: 1, explanation: "Feedback turns rejection into a learning opportunity." },
      { type: "reorder", question: "Order steps after failure:", items: ["Extract lesson", "Feel feelings", "Plan next action", "Accept reality"], correctOrder: [1, 3, 0, 2], explanation: "Feel → accept → learn → act." },
      { type: "fill-blank", question: "Failure is an _______, not an identity.", correct: ["event", "experience", "data point", "opportunity"], explanation: "You are not a failure — you had a failed attempt." },
      { type: "reflection", question: "What's a 'failure' that ultimately made you stronger? What did you learn?", minChars: 50, explanation: "Reframing past failures builds your resilience muscle." }
    ]
  },
  {
    id: "mh-12",
    title: "Building Emotional Agility",
    unit: 4,
    unitName: "Building Resilience",
    exercises: [
      { type: "multiple-choice", question: "Emotional agility means...", options: ["Having only positive emotions", "Controlling your feelings completely", "Navigating emotions flexibly", "Never feeling sad"], correct: 2, explanation: "Agility is about moving through emotions without getting stuck." },
      { type: "true-false", statement: "Emotional agility requires pushing away hard feelings.", correct: false, explanation: "Agility requires acknowledging feelings without being ruled by them." },
      { type: "scenario", question: "You feel jealous of a friend's success. What's an agile response?", options: ["Cut them off", "Tell them you're jealous and ask how they did it", "Compare yourself constantly", "Try to one-up them"], correct: 1, explanation: "Emotional agility allows hard feelings and turns them into growth." },
      { type: "reorder", question: "Order Susan David's emotional agility steps:", items: ["Walking your why", "Labeling emotions", "Letting go", "Showing up"], correctOrder: [3, 1, 2, 0], explanation: "Show up → label → let go → walk your why." },
      { type: "fill-blank", question: "_______ your emotions doesn't make them go away — it makes them stronger.", correct: ["suppressing", "bottling", "ignoring", "pushing down"], explanation: "Suppressed emotions leak out in other ways." },
      { type: "reflection", question: "What's an emotion you usually push away? What happens if you just let it be there for 60 seconds?", minChars: 50, explanation: "Making space for feelings reduces their power over you." }
    ]
  },
  // UNIT 5: Daily Mental Fitness
  {
    id: "mh-13",
    title: "Journaling That Works",
    unit: 5,
    unitName: "Daily Mental Fitness",
    exercises: [
      { type: "multiple-choice", question: "Effective journaling is about...", options: ["Perfect grammar", "Long entries every day", "Honest reflection", "Writing only happy thoughts"], correct: 2, explanation: "It's about truth and clarity, not perfection or length." },
      { type: "true-false", statement: "Journaling has to be in a physical notebook.", correct: false, explanation: "Phone notes, voice memos, anything works — it's the process, not the medium." },
      { type: "scenario", question: "You're feeling stuck. What journal prompt would help most?", options: ["Everything is terrible", "What am I grateful for today?", "What's bothering me, and what's one small next step?", "I'm a loser"], correct: 2, explanation: "Specific, solution-oriented prompts prevent spiraling." },
      { type: "reorder", question: "Order a simple daily journal structure:", items: ["What went well", "What I'll focus on tomorrow", "What happened today", "How I felt"], correctOrder: [2, 3, 0, 1], explanation: "Events → feelings → gratitude → tomorrow." },
      { type: "fill-blank", question: "Journaling helps you _______ your thoughts.", correct: ["organize", "clarify", "process", "externalize"], explanation: "Writing thoughts down makes them easier to see and work with." },
      { type: "reflection", question: "Write a 3-sentence journal entry right now about today. How does it feel to externalize it?", minChars: 50, explanation: "Small consistent entries create big change over time." }
    ]
  },
  {
    id: "mh-14",
    title: "Mindfulness in 5 Minutes",
    unit: 5,
    unitName: "Daily Mental Fitness",
    exercises: [
      { type: "multiple-choice", question: "Mindfulness is about...", options: ["Emptying your mind completely", "Paying attention on purpose, non-judgmentally", "Meditating for hours", "Only thinking positive thoughts"], correct: 1, explanation: "Mindfulness is about noticing, not stopping thoughts." },
      { type: "true-false", statement: "You need to sit cross-legged on a cushion to practice mindfulness.", correct: false, explanation: "Mindfulness can be done anywhere, any position — even standing in line." },
      { type: "scenario", question: "You're waiting for a bus and feeling impatient. What's a mindful response?", options: ["Check your phone every 10 seconds", "Notice 3 things about your surroundings without judgment", "Tap your foot angrily", "Complain out loud"], correct: 1, explanation: "Waiting is a perfect mini-mindfulness opportunity." },
      { type: "reorder", question: "Order the 5-4-3-2-1 mindful check:", items: ["2 Smells", "1 Taste", "5 Sights", "4 Touches", "3 Sounds"], correctOrder: [2, 3, 4, 0, 1], explanation: "5 sights, 4 touches, 3 sounds, 2 smells, 1 taste." },
      { type: "fill-blank", question: "Mindfulness involves being in the _______ moment.", correct: ["present", "now", "current"], explanation: "Not ruminating past or worrying future — just now." },
      { type: "reflection", question: "Try a 1-minute mindful check right now. What do you notice that you usually miss?", minChars: 50, explanation: "Regular practice builds your 'attention muscle'." }
    ]
  },
  {
    id: "mh-15",
    title: "Your Mental Health Toolkit",
    unit: 5,
    unitName: "Daily Mental Fitness",
    exercises: [
      { type: "multiple-choice", question: "A mental health toolkit is for...", options: ["Perfect days only", "Crisis moments only", "Daily use and tough moments alike", "Other people, not you"], correct: 2, explanation: "Tools work best if used preventatively, not just in crisis." },
      { type: "true-false", statement: "Your toolkit should stay the same forever.", correct: false, explanation: "Your needs change — update your toolkit as you grow." },
      { type: "scenario", question: "You're putting together your toolkit. Which is LEAST important?", options: ["Breathing exercises", "Contacts for support", "Self-soothing activities", "A perfect life plan"], correct: 3, explanation: "Toolkits are for reality, not perfection." },
      { type: "reorder", question: "Order how to organize your toolkit:", items: ["List them", "Update monthly", "Try items", "Brainstorm possible tools"], correctOrder: [3, 2, 0, 1], explanation: "Brainstorm → try → list → update." },
      { type: "fill-blank", question: "Your toolkit should be _______ to access.", correct: ["easy", "quick", "simple", "available"], explanation: "You want tools you can use at a moment's notice." },
      { type: "reflection", question: "What are 3 tools you want in your mental health toolkit? Why?", minChars: 50, explanation: "Personalizing makes tools actually useful for you." }
    ]
  }
];

// ------------------------------
// 💬 RELATIONSHIPS LESSONS
// ------------------------------
const relationshipsLessons = [
  {
    id: "rel-1",
    title: "Why We Miscommunicate",
    unit: 1,
    unitName: "Communication Foundations",
    exercises: [
      { type: "multiple-choice", question: "Most miscommunication happens because...", options: ["People are stupid", "We assume others think like us", "Everyone is selfish", "Technology is bad"], correct: 1, explanation: "We forget everyone has unique filters, experiences, and interpretations." },
      { type: "true-false", statement: "If you meant something clearly, the other person understood it.", correct: false, explanation: "Meaning is in the listener, not the speaker — always check for understanding." },
      { type: "scenario", question: "You tell your partner, 'We never do anything fun,' and they get defensive. What happened?", options: ["They're just sensitive", "They heard criticism instead of your desire for connection", "You're right, they're boring", "Relationships are too hard"], correct: 1, explanation: "People react to how they interpret words, not your intent." },
      { type: "reorder", question: "Order the communication cycle:", items: ["Receiver interprets", "Receiver responds", "Sender encodes message", "Sender has intention"], correctOrder: [3, 2, 0, 1], explanation: "Intention → encode → interpret → respond." },
      { type: "fill-blank", question: "Communication is about _______, not perfection.", correct: ["connection", "understanding", "clarity"], explanation: "Prioritize being understood over being 'right'." },
      { type: "reflection", question: "When was the last time you were misinterpreted? What could you have said differently?", minChars: 50, explanation: "Analyzing missteps helps you communicate better next time." }
    ]
  },
  {
    id: "rel-2",
    title: "Active Listening",
    unit: 1,
    unitName: "Communication Foundations",
    exercises: [
      { type: "multiple-choice", question: "Active listening means...", options: ["Nodding while thinking about your reply", "Truly hearing and trying to understand", "Interrupting to ask questions", "Agreeing with everything"], correct: 1, explanation: "Active listening requires holding space for their story first." },
      { type: "true-false", statement: "Giving advice is the best way to show you're listening.", correct: false, explanation: "Often people just want to feel heard, not fixed." },
      { type: "scenario", question: "Your friend is venting about work. What's the best active listening response?", options: ["Here's exactly what you should do", "That sounds really frustrating. What was that like for you?", "At least you have a job!", "That's not a big deal"], correct: 1, explanation: "Reflecting feelings and asking open questions makes people feel seen." },
      { type: "reorder", question: "Order active listening steps:", items: ["Reflect back", "Listen fully", "Ask open questions", "Don't interrupt"], correctOrder: [3, 1, 0, 2], explanation: "Don't interrupt → listen fully → reflect → ask." },
      { type: "fill-blank", question: "Active listening uses your _______ as much as your ears.", correct: ["eyes", "body", "attention", "presence"], explanation: "Your body language and eye contact show you're present." },
      { type: "reflection", question: "Think of someone who makes you feel heard. What do they do differently?", minChars: 50, explanation: "Modeling effective listeners helps you become one." }
    ]
  },
  {
    id: "rel-3",
    title: "Non-Verbal Communication",
    unit: 1,
    unitName: "Communication Foundations",
    exercises: [
      { type: "multiple-choice", question: "What percentage of communication is estimated to be non-verbal?", options: ["10%", "30%", "50%", "70-90%"], correct: 3, explanation: "Body language, tone, facial expressions carry most weight." },
      { type: "true-false", statement: "Your words matter more than your tone.", correct: false, explanation: "People feel your tone before they process your words." },
      { type: "scenario", question: "You're saying 'I'm fine' but your arms are crossed and you're avoiding eye contact. What does the other person likely believe?", options: ["You're totally fine", "You're lying and actually upset", "You're happy", "You need a hug"], correct: 1, explanation: "Non-verbal signals override words when they contradict." },
      { type: "reorder", question: "These non-verbals make you seem approachable:", items: ["Relaxed posture", "Uncrossed arms", "Eye contact", "Genuine smile"], correctOrder: [3, 2, 1, 0], explanation: "All contribute to warmth and openness." },
      { type: "fill-blank", question: "Your _______ communicates more than your words.", correct: ["body", "tone", "face", "posture"], explanation: "Congruent words and body language build trust." },
      { type: "reflection", question: "What non-verbal habits do you have? How might they affect others?", minChars: 50, explanation: "Awareness lets you align your non-verbals with your intentions." }
    ]
  },
  {
    id: "rel-4",
    title: "Conflict Is Normal",
    unit: 2,
    unitName: "Conflict & Boundaries",
    exercises: [
      { type: "multiple-choice", question: "Healthy relationships have...", options: ["No conflict ever", "Conflict handled respectfully", "Constant fighting", "One person always gives in"], correct: 1, explanation: "Conflict is inevitable — it's how you handle it that matters." },
      { type: "true-false", statement: "Conflict means the relationship is failing.", correct: false, explanation: "Conflict is an opportunity for deeper understanding." },
      { type: "scenario", question: "You and your roommate clash about chores. What's a healthy start?", options: ["Stop talking to them", "I'm sick of doing everything!", "I feel overwhelmed when the dishes pile up — can we make a plan?", "Move out immediately"], correct: 2, explanation: "Using 'I' statements avoids blaming and invites collaboration." },
      { type: "reorder", question: "Order healthy conflict steps:", items: ["Listen", "Attack", "Find solution", "Calm down first", "Use 'I' statements"], correctOrder: [3, 4, 0, 2], explanation: "Calm → I-statements → listen → solution (no attacking!)" },
      { type: "fill-blank", question: "Conflict is about _______, not enemies.", correct: ["differences", "needs", "understanding"], explanation: "You're on the same team solving a problem together." },
      { type: "reflection", question: "What's a conflict you avoided? What's a safe way to bring it up?", minChars: 50, explanation: "Avoidance usually makes conflict bigger later." }
    ]
  },
  {
    id: "rel-5",
    title: "Fighting Fair",
    unit: 2,
    unitName: "Conflict & Boundaries",
    exercises: [
      { type: "multiple-choice", question: "Which is a fair fight rule?", options: ["Bring up past mistakes", "Stay on topic", "Use name-calling", "Give the silent treatment"], correct: 1, explanation: "Fair fights focus on one issue at a time." },
      { type: "true-false", statement: "You should always finish an argument immediately.", correct: false, explanation: "Taking a 20-minute break to cool down prevents escalation." },
      { type: "scenario", question: "Fight gets heated. What's the best 'pause' line?", options: ["I'm done with this", "I need 20 minutes to calm down, can we talk later?", "You're impossible", "Whatever"], correct: 1, explanation: "A respectful pause preserves safety and respect." },
      { type: "reorder", question: "Order repair attempt steps:", items: ["Take responsibility", "Listen", "Suggest repair", "Acknowledge hurt"], correctOrder: [3, 1, 0, 2], explanation: "Acknowledge → listen → take responsibility → repair." },
      { type: "fill-blank", question: "The goal of fighting is _______, not winning.", correct: ["understanding", "resolution", "connection", "clarity"], explanation: "Mutual resolution beats 'proving you're right'." },
      { type: "reflection", question: "What's your worst fighting habit? How can you improve it?", minChars: 50, explanation: "Naming your patterns lets you interrupt them." }
    ]
  },
  {
    id: "rel-6",
    title: "Setting Boundaries Without Guilt",
    unit: 2,
    unitName: "Conflict & Boundaries",
    exercises: [
      { type: "multiple-choice", question: "Boundaries are...", options: ["Mean and selfish", "Rules you set for how you want to be treated", "Walls to keep people out", "Only for difficult people"], correct: 1, explanation: "Boundaries define what's acceptable and safe for you." },
      { type: "true-false", statement: "Setting boundaries means you don't care about others.", correct: false, explanation: "Healthy boundaries let you care about others AND yourself." },
      { type: "scenario", question: "Friend asks for money again, and you can't afford it. What's a good boundary response?", options: ["Here's all my savings", "Sorry, I can't lend money right now — I hope you find a solution", "I'm so selfish", "You're just using me"], correct: 1, explanation: "Clear, kind, no over-explaining needed." },
      { type: "reorder", question: "Order boundary-setting:", items: ["Communicate clearly", "Define your limit", "Know your why", "Stick to it"], correctOrder: [2, 1, 0, 3], explanation: "Why → what → communicate → maintain." },
      { type: "fill-blank", question: "No is a complete _______.", correct: ["sentence", "answer", "boundary"], explanation: "You don't owe long justifications for your no." },
      { type: "reflection", question: "What's a boundary you need to set? How would saying it make you feel?", minChars: 50, explanation: "Boundaries get easier with practice — start small." }
    ]
  },
  {
    id: "rel-7",
    title: "The 5 Love Languages",
    unit: 3,
    unitName: "Emotional Connection",
    exercises: [
      { type: "multiple-choice", question: "Which is NOT one of the 5 love languages?", options: ["Words of affirmation", "Gifts", "Physical touch", "Long letters"], correct: 3, explanation: "The five: words, acts, gifts, time, touch." },
      { type: "true-false", statement: "Everyone has the same primary love language.", correct: false, explanation: "People give/receive love differently — don't assume yours matches." },
      { type: "scenario", question: "Your partner's love language is acts of service. What would mean most?", options: ["Buying them an expensive gift", "Doing their least favorite chore without being asked", "Telling them they're great once", "Spending money on them"], correct: 1, explanation: "Acts of service show love through concrete help." },
      { type: "reorder", question: "The 5 love languages are:", items: ["Acts of service", "Receiving gifts", "Words of affirmation", "Quality time", "Physical touch"], correctOrder: [2, 3, 0, 1, 4], explanation: "All are valid — people have different preferences." },
      { type: "fill-blank", question: "Love languages are about how you feel most _______.", correct: ["loved", "seen", "valued", "appreciated"], explanation: "They're about feeling loved in your specific language." },
      { type: "reflection", question: "What's your primary love language? How do you know?", minChars: 50, explanation: "Naming yours helps others love you better." }
    ]
  },
  {
    id: "rel-8",
    title: "Building Trust",
    unit: 3,
    unitName: "Emotional Connection",
    exercises: [
      { type: "multiple-choice", question: "Trust is built through...", options: ["Big gestures once", "Consistency over time", "Perfect behavior", "Saying 'trust me' a lot"], correct: 1, explanation: "Small, reliable actions accumulate into trust." },
      { type: "true-false", statement: "Trust once broken can never be rebuilt.", correct: false, explanation: "Trust can be rebuilt with consistent accountability, time, and effort." },
      { type: "scenario", question: "You forgot an important date with a friend. What's the best trust-building response?", options: ["Oops, sorry", "Make a joke about how forgetful you are", "I'm really sorry I forgot — that matters, and I'll set reminders from now on", "Blame your busy schedule"], correct: 2, explanation: "Apologize sincerely + take concrete corrective action." },
      { type: "reorder", question: "Order trust-building steps (after breach):", items: ["Show change over time", "Make amends", "Listen to impact", "Take responsibility"], correctOrder: [3, 2, 1, 0], explanation: "Responsibility → listen → amends → consistent change." },
      { type: "fill-blank", question: "Trust is like a _______ — slow to build, fast to break.", correct: ["mirror", "vase", "house", "bank"], explanation: "Careful with it — rebuilding is possible but takes work." },
      { type: "reflection", question: "When has someone earned your trust? What did they do?", minChars: 50, explanation: "Identifying trust-building behaviors helps you build trust too." }
    ]
  },
  {
    id: "rel-9",
    title: "Vulnerability as Strength",
    unit: 3,
    unitName: "Emotional Connection",
    exercises: [
      { type: "multiple-choice", question: "Vulnerability is...", options: ["Weakness", "The courage to show up and be seen", "Over-sharing everything", "Only for therapy"], correct: 1, explanation: "Brené Brown defines vulnerability as 'uncertainty, risk, and emotional exposure' — and it's at the heart of connection." },
      { type: "true-false", statement: "Being vulnerable means people will definitely hurt you.", correct: false, explanation: "Yes, risk exists — but vulnerability is also where love and belonging happen." },
      { type: "scenario", question: "You really admire a coworker but are scared to say it. What's vulnerable but courageous?", options: ["Never say anything", "Send them a note: 'Your presentation really inspired me this week — loved how you handled that question!'", "Tell everyone else first", "Just keep it to yourself forever"], correct: 1, explanation: "Small, safe vulnerabilities build deeper connections." },
      { type: "reorder", question: "Order safe vulnerability steps:", items: ["Start small", "Choose safe people", "Notice how it feels", "Share something real"], correctOrder: [1, 0, 3, 2], explanation: "Choose safety → small → share → reflect." },
      { type: "fill-blank", question: "Vulnerability is the birthplace of _______.", correct: ["love", "connection", "creativity", "joy"], explanation: "Brown's research shows these require vulnerability." },
      { type: "reflection", question: "What's a small vulnerable thing you could do this week? What scares you about it? What excites you?", minChars: 50, explanation: "Small steps build your vulnerability muscle." }
    ]
  },
  {
    id: "rel-10",
    title: "How to Give Feedback",
    unit: 4,
    unitName: "Difficult Conversations",
    exercises: [
      { type: "multiple-choice", question: "Good feedback is...", options: ["Blame-focused", "Sandwich method: good-bad-good", "Specific, kind, actionable", "Delivered publicly"], correct: 2, explanation: "Skip the confusing sandwich — be clear, kind, specific." },
      { type: "true-false", statement: "Feedback should only be negative.", correct: false, explanation: "Positive feedback reinforces what's working — don't forget that!" },
      { type: "scenario", question: "Friend is often late. What's a kind, clear way to say it?", options: ["You're so rude!", "When you're late, it makes me feel like my time doesn't matter. Could we plan to be on time?", "I guess I'll just wait forever", "Stop being late"], correct: 1, explanation: "Observation → impact → request — classic non-blaming." },
      { type: "reorder", question: "Order SBI feedback model:", items: ["Impact", "Behavior", "Situation"], correctOrder: [2, 1, 0], explanation: "Situation → Behavior → Impact." },
      { type: "fill-blank", question: "Feedback should be about _______, not character.", correct: ["actions", "behaviors", "specific things"], explanation: "Attack the action, not the person." },
      { type: "reflection", question: "What feedback do you need to give someone? Practice writing it out using SBI.", minChars: 50, explanation: "Practicing makes hard conversations easier." }
    ]
  },
  {
    id: "rel-11",
    title: "Receiving Criticism",
    unit: 4,
    unitName: "Difficult Conversations",
    exercises: [
      { type: "multiple-choice", question: "When receiving criticism, first...", options: ["Defend yourself immediately", "Listen and ask clarifying questions", "Argue back", "Get defensive"], correct: 1, explanation: "Make sure you understand before reacting." },
      { type: "true-false", statement: "All criticism is true and you must agree with it.", correct: false, explanation: "You can listen without agreeing — choose what resonates." },
      { type: "scenario", question: "Someone gives you harsh feedback. What's a calm response?", options: ["Screw you!", "I hear how upset you are. Can you give me a specific example so I understand better?", "Cry", "Leave immediately"], correct: 1, explanation: "Acknowledging emotion and asking for specifics de-escalates." },
      { type: "reorder", question: "Order receiving criticism gracefully:", items: ["Decide what fits", "Listen fully", "Say thank you", "Ask questions"], correctOrder: [1, 3, 0, 2], explanation: "Listen → ask → decide → thank (even if hard)" },
      { type: "fill-blank", question: "Criticism often contains a grain of _______, even if poorly delivered.", correct: ["truth", "usefulness", "feedback"], explanation: "You can separate the message from the delivery." },
      { type: "reflection", question: "What criticism is hardest for you to hear? Why?", minChars: 50, explanation: "Understanding your triggers reduces reactivity." }
    ]
  },
  {
    id: "rel-12",
    title: "Apologizing Effectively",
    unit: 4,
    unitName: "Difficult Conversations",
    exercises: [
      { type: "multiple-choice", question: "A good apology includes...", options: ["Making excuses", "'I'm sorry you felt that way'", "Taking responsibility without 'but'", "Blaming the other person"], correct: 2, explanation: "'But' cancels the apology — just responsibility." },
      { type: "true-false", statement: "Apologizing means you're a terrible person.", correct: false, explanation: "Apologizing means you value the relationship more than your ego." },
      { type: "scenario", question: "You missed a friend's birthday dinner. What's a good apology?", options: ["Sorry you were upset, but I was busy", "I'm so sorry I missed your dinner. That was thoughtless, and you're important to me. Can I take you out this week?", "It wasn't that big a deal", "I forgot, whatever"], correct: 1, explanation: "Sincere apology + recognition of impact + amends." },
      { type: "reorder", question: "Order true apology components:", items: ["Amends", "Responsibility", "Acknowledgment of impact", "Regret"], correctOrder: [3, 1, 2, 0], explanation: "Regret → responsibility → impact → amends." },
      { type: "fill-blank", question: "A real apology doesn't include the word _______.", correct: ["but", "excuse", "however"], explanation: "'But' negates everything before it." },
      { type: "reflection", question: "What's an apology you owe someone? Write it out (even if you don't send it yet).", minChars: 50, explanation: "Practicing helps the real one come out smoother." }
    ]
  },
  {
    id: "rel-13",
    title: "Attachment Styles",
    unit: 5,
    unitName: "Relationship Patterns",
    exercises: [
      { type: "multiple-choice", question: "Which attachment style fears abandonment?", options: ["Secure", "Anxious", "Avoidant", "Disorganized"], correct: 1, explanation: "Anxious attachment often worries about being left." },
      { type: "true-false", statement: "Your attachment style can't change.", correct: false, explanation: "Attachment styles are learned and can be earned secure with work." },
      { type: "scenario", question: "You text a partner and don't get a reply for an hour. Anxious thoughts spiral. What's a healthier internal response?", options: ["They definitely hate me!", "They haven't replied — they might be busy. I'll focus on something else for now.", "Text them 10 more times", "Assume the relationship is over"], correct: 1, explanation: "Secure self-talk creates space between trigger and reaction." },
      { type: "reorder", question: "The 4 attachment styles:", items: ["Disorganized", "Anxious", "Secure", "Avoidant"], correctOrder: [2, 1, 3, 0], explanation: "Secure, anxious, avoidant, disorganized." },
      { type: "fill-blank", question: "_______ attachment is the goal.", correct: ["secure", "earned secure"], explanation: "Secure means comfortable with intimacy and independence." },
      { type: "reflection", question: "What's your attachment pattern in relationships? Where do you think it comes from?", minChars: 50, explanation: "Understanding your style helps you choose different responses." }
    ]
  },
  {
    id: "rel-14",
    title: "Breaking Toxic Patterns",
    unit: 5,
    unitName: "Relationship Patterns",
    exercises: [
      { type: "multiple-choice", question: "A red flag is...", options: ["Something cute", "A warning sign that shouldn't be ignored", "A red-colored object", "Just a quirk"], correct: 1, explanation: "Red flags are early indicators of unhealthy patterns." },
      { type: "true-false", statement: "You can change other people's toxic behavior.", correct: false, explanation: "You can only change yourself and your boundaries." },
      { type: "scenario", question: "Friend constantly cancels last minute, never checks in, but expects you to be there. What's a boundary?", options: ["Keep letting them", "I care about you, but I can't keep making plans that get canceled last minute. Let me know when you're actually available", "Never talk to them again", "Cancel on them back"], correct: 1, explanation: "Boundaries protect your time and energy without burning bridges." },
      { type: "reorder", question: "Steps to change a relationship pattern:", items: ["Set boundaries", "Notice pattern", "Stick to it", "Choose different response"], correctOrder: [1, 3, 0, 2], explanation: "Notice → choose different → boundaries → maintain." },
      { type: "fill-blank", question: "Patterns repeat until you _______ them.", correct: ["interrupt", "notice", "change", "break"], explanation: "Awareness is the first step to change." },
      { type: "reflection", question: "What relationship pattern do you keep repeating? How would your life change if you broke it?", minChars: 50, explanation: "Clarity on what you want instead makes breaking patterns possible." }
    ]
  },
  {
    id: "rel-15",
    title: "Building Your Support Network",
    unit: 5,
    unitName: "Relationship Patterns",
    exercises: [
      { type: "multiple-choice", question: "Your support network should be...", options: ["Only one person", "Diverse people who fill different needs", "Lots of casual acquaintances", "Perfect people"], correct: 1, explanation: "Different people offer different strengths." },
      { type: "true-false", statement: "Asking for help means you're weak.", correct: false, explanation: "Asking for help is human, courageous, and strengthens relationships." },
      { type: "scenario", question: "You're feeling overwhelmed. Who's the best person to reach out to first?", options: ["Someone who always fixes you", "A safe friend who listens without judgment", "No one, handle it alone", "A random acquaintance"], correct: 1, explanation: "Start with your safest person." },
      { type: "reorder", question: "How to build a network:", items: ["Nurture existing", "Show up for them", "Ask for what you need", "Meet new people"], correctOrder: [3, 0, 1, 2], explanation: "Meet new → nurture existing → show up → ask." },
      { type: "fill-blank", question: "Your circle of support includes people who celebrate your _______.", correct: ["wins", "successes", "joy", "growth"], explanation: "True supporters celebrate, not compete." },
      { type: "reflection", question: "Who's in your support system right now? Is there a gap you want to fill?", minChars: 50, explanation: "Auditing helps you see what you have and what you need." }
    ]
  }
];

// ------------------------------
// 💼 CAREER LESSONS
// ------------------------------
const careerLessons = [
  {
    id: "car-1",
    title: "Defining Your Career Vision",
    unit: 1,
    unitName: "Clarity & Direction",
    exercises: [
      { type: "multiple-choice", question: "A career vision is about...", options: ["A specific job title by age 30", "How you want to feel and what impact you want to make", "Making the most money", "What your parents want for you"], correct: 1, explanation: "Vision is about purpose and feeling, not just a title." },
      { type: "true-false", statement: "Your career vision has to stay the same forever.", correct: false, explanation: "Visions evolve as you grow and learn." },
      { type: "scenario", question: "You don't know what you want to do. What's the best first step?", options: ["Quit everything", "Try a bunch of small experiments", "Decide now and never change", "Just pick something"], correct: 1, explanation: "Small experiments generate data about what you like." },
      { type: "reorder", question: "Steps to build vision:", items: ["Notice energizing moments", "Draft vision statement", "Collect clues", "Test small"], correctOrder: [2, 0, 1, 3], explanation: "Collect clues → notice energy → draft → test." },
      { type: "fill-blank", question: "Your career should align with your _______.", correct: ["values", "interests", "strengths", "passions"], explanation: "Alignment creates satisfaction and motivation." },
      { type: "reflection", question: "What does your ideal workday look like in 5 years? What are you doing, how do you feel?", minChars: 50, explanation: "Imagining details makes vision tangible." }
    ]
  },
  {
    id: "car-2",
    title: "Your Strengths vs. Skills",
    unit: 1,
    unitName: "Clarity & Direction",
    exercises: [
      { type: "multiple-choice", question: "Strengths are...", options: ["Things you're good at AND energized by", "Hard skills only", "Things you're bad at", "Only soft skills"], correct: 0, explanation: "Strengths = talent + skill + energy." },
      { type: "true-false", statement: "You should only focus on fixing weaknesses.", correct: false, explanation: "Leveraging strengths gets better results than fixing weaknesses alone." },
      { type: "scenario", question: "You hate public speaking but your job requires it. What's the best approach?", options: ["Quit immediately", "Play to your strengths where possible, improve speaking to 'good enough'", "Never speak again", "Let someone else always do it"], correct: 1, explanation: "Fix weaknesses to 'not fatal' and lean into strengths." },
      { type: "reorder", question: "Strengths spotting steps:", items: ["Notice what you learn fast", "What makes time fly?", "When do you feel powerful?", "Ask others"], correctOrder: [1, 2, 0, 3], explanation: "Time flies → feel powerful → learn fast → ask others." },
      { type: "fill-blank", question: "Strengths make you feel _______.", correct: ["energized", "powerful", "in flow", "strong"], explanation: "Energy is the clue to strengths." },
      { type: "reflection", question: "What's something you do that makes you lose track of time? Why do you love it?", minChars: 50, explanation: "Flow states point to strengths." }
    ]
  },
  {
    id: "car-3",
    title: "The Ikigai Framework",
    unit: 1,
    unitName: "Clarity & Direction",
    exercises: [
      { type: "multiple-choice", question: "Ikigai is the intersection of:", options: ["Money and fame", "What you love, what you're good at, what the world needs, what you can be paid for", "Only passion", "What others tell you to do"], correct: 1, explanation: "The sweet spot of passion, skill, need, and reward." },
      { type: "true-false", statement: "Everyone finds their ikigai overnight.", correct: false, explanation: "Ikigai is often discovered gradually through experimentation." },
      { type: "scenario", question: "You love art, are good at design, the world needs better visuals, but struggle to make money. What's the ikigai step?", options: ["Quit art", "Explore paid design opportunities while learning to monetize", "Do art only as a hobby", "Give up"], correct: 1, explanation: "Ikigai takes time — build skills and income streams gradually." },
      { type: "reorder", question: "Ikigai components:", items: ["What you love", "What you're good at", "What the world needs", "What you can be paid for"], correctOrder: [0, 1, 2, 3], explanation: "All four create long-term fulfillment." },
      { type: "fill-blank", question: "Ikigai is a Japanese concept meaning '_______ for being.'", correct: ["reason", "purpose", "meaning"], explanation: "Your reason to get up in the morning." },
      { type: "reflection", question: "Map your own ikigai — what's in each quadrant for you?", minChars: 50, explanation: "Mapping reveals gaps and opportunities." }
    ]
  },
  {
    id: "car-4",
    title: "Deep Work Explained",
    unit: 2,
    unitName: "Productivity",
    exercises: [
      { type: "multiple-choice", question: "Deep work is...", options: ["Working longer hours", "Professional activities performed in a state of distraction-free concentration", "Multitasking", "Constantly checking email"], correct: 1, explanation: "Deep work creates real value and skill growth." },
      { type: "true-false", statement: "You can do deep work with notifications on.", correct: false, explanation: "Distractions destroy deep work — turn them off." },
      { type: "scenario", question: "You need to write an important report. What's the best deep work setup?", options: ["Phone nearby, TV on", "1-2 hour block, phone on Do Not Disturb, closed office/space", "Check social media every 15 minutes", "Do it while also answering texts"], correct: 1, explanation: "Unbroken blocks, no notifications, single tasking." },
      { type: "reorder", question: "How to start deep work:", items: ["Start small (90 mins)", "Build ritual", "Remove distractions", "Schedule it"], correctOrder: [3, 2, 0, 1], explanation: "Schedule → remove distractions → start small → ritual." },
      { type: "fill-blank", question: "Deep work creates _______ that's hard to replicate.", correct: ["value", "skill", "quality"], explanation: "AI and distractions make deep work increasingly rare and valuable." },
      { type: "reflection", question: "When do you do your best work? How can you create more of those conditions?", minChars: 50, explanation: "Understanding your own rhythm lets you design better days." }
    ]
  },
  {
    id: "car-5",
    title: "Beating Procrastination",
    unit: 2,
    unitName: "Productivity",
    exercises: [
      { type: "multiple-choice", question: "Procrastination is usually about...", options: ["Laziness", "Discomfort avoidance", "Not enough time", "Being dumb"], correct: 1, explanation: "We procrastinate to avoid uncomfortable feelings (boredom, anxiety, overwhelm)." },
      { type: "true-false", statement: "To beat procrastination, you need motivation first.", correct: false, explanation: "Action comes before motivation — just start tiny." },
      { type: "scenario", question: "You're procrastinating on a huge project. What's the best first step?", options: ["Do the whole thing today", "2-minute version: open the document and type the title", "Wait for inspiration", "Play video games instead"], correct: 1, explanation: "The 2-minute rule reduces activation energy." },
      { type: "reorder", question: "Beat procrastination steps:", items: ["Start tiny", "Remove friction", "Forgive yourself", "Name the discomfort"], correctOrder: [3, 1, 0, 2], explanation: "Name → remove friction → start tiny → forgive slips." },
      { type: "fill-blank", question: "_______ perfection; do 'good enough' first.", correct: ["Forget", "Drop", "Abandon", "Skip"], explanation: "Done is better than perfect — you can iterate later." },
      { type: "reflection", question: "What do you procrastinate on most? What discomfort are you avoiding?", minChars: 50, explanation: "Naming the feeling takes away its power." }
    ]
  },
  {
    id: "car-6",
    title: "Managing Your Energy",
    unit: 2,
    unitName: "Productivity",
    exercises: [
      { type: "multiple-choice", question: "You should manage your _______, not just your time.", options: ["energy", "phone", "desk", "emails"], correct: 0, explanation: "Energy fluctuates; align hard tasks with peak energy." },
      { type: "true-false", statement: "You can work productively 12 hours straight.", correct: false, explanation: "Humans aren't machines — we need rest cycles (ultradian rhythms)." },
      { type: "scenario", question: "You're a morning person. When should you do your hardest work?", options: ["After lunch", "First thing in the morning", "Night", "Whenever"], correct: 1, explanation: "Match your hardest work to your natural energy peaks." },
      { type: "reorder", question: "Energy management steps:", items: ["Protect peaks", "Renew often", "Track your energy", "Match work to energy"], correctOrder: [2, 0, 3, 1], explanation: "Track → protect peaks → match → renew." },
      { type: "fill-blank", question: "Peak energy times are called your _______.", correct: ["golden hours", "power hours", "peak times"], explanation: "These are your most valuable hours." },
      { type: "reflection", question: "Track your energy for a day — when are you sharpest? Most tired?", minChars: 50, explanation: "Awareness is the first step to using energy better." }
    ]
  },
  {
    id: "car-7",
    title: "Personal Branding",
    unit: 3,
    unitName: "Professional Skills",
    exercises: [
      { type: "multiple-choice", question: "Your personal brand is...", options: ["A fancy logo", "What people say about you when you're not in the room", "Being fake", "Only for influencers"], correct: 1, explanation: "Your brand is your reputation and unique value." },
      { type: "true-false", statement: "Personal branding requires being on social media 24/7.", correct: false, explanation: "Branding is about consistency and quality, not constant posting." },
      { type: "scenario", question: "You want to build your brand around data storytelling. What's a concrete action?", options: ["Post memes", "Share one clear data visualization and insight a week", "Talk about how great you are", "Do nothing"], correct: 1, explanation: "Consistent, valuable content builds your brand." },
      { type: "reorder", question: "Build personal brand:", items: ["Share value consistently", "Define your niche", "Be authentic", "Show your work"], correctOrder: [1, 2, 3, 0], explanation: "Niche → authentic → show work → consistent value." },
      { type: "fill-blank", question: "Your brand is about your unique _______.", correct: ["value", "strengths", "perspective", "contribution"], explanation: "What do only you bring?" },
      { type: "reflection", question: "What do you want to be known for in your career? How do you show that now?", minChars: 50, explanation: "Clarity helps you act consistently with that brand." }
    ]
  },
  {
    id: "car-8",
    title: "Networking That Doesn't Feel Fake",
    unit: 3,
    unitName: "Professional Skills",
    exercises: [
      { type: "multiple-choice", question: "Good networking is about...", options: ["Collecting business cards", "Genuine relationships and giving value first", "Asking for favors immediately", "Only talking to important people"], correct: 1, explanation: "Networking is about mutual connection, not transactional use." },
      { type: "true-false", statement: "You have to be extroverted to network.", correct: false, explanation: "Introverts can network deeply with fewer, more meaningful conversations." },
      { type: "scenario", question: "You admire someone's work. What's a good outreach message?", options: ["Give me a job!", "I loved your recent project on X — specifically how you did Y. Would love to learn more if you have 15 minutes!", "You're my hero", "Please mentor me"], correct: 1, explanation: "Specific genuine praise + clear small request = higher response rate." },
      { type: "reorder", question: "Networking steps:", items: ["Give first", "Follow up", "Stay in touch lightly", "Meet people"], correctOrder: [3, 0, 1, 2], explanation: "Meet → give first → follow up → light touches." },
      { type: "fill-blank", question: "Networking is about _______, not taking.", correct: ["giving", "helping", "contributing", "adding value"], explanation: "Giving first builds trust and reciprocity." },
      { type: "reflection", question: "Who's someone you want to connect with? What value could you offer first?", minChars: 50, explanation: "Thinking about what you give shifts the dynamic." }
    ]
  },
  {
    id: "car-9",
    title: "Negotiation Basics",
    unit: 3,
    unitName: "Professional Skills",
    exercises: [
      { type: "multiple-choice", question: "The best time to negotiate salary is...", options: ["Never", "After you have a formal offer", "At the interview start", "Whenever"], correct: 1, explanation: "Wait for the offer before negotiating — you have more leverage." },
      { type: "true-false", statement: "Negotiation is adversarial.", correct: false, explanation: "Good negotiation is collaborative — both sides getting what they need." },
      { type: "scenario", question: "You get a job offer. How do you respond?", options: ["Yes immediately!", 'Thank you! I'm excited about this role. Based on my research and experience, I was hoping we could discuss a salary closer to $X', "Demand double", "Silence"], correct: 1, explanation: "Gratitude first, then anchor with research." },
      { type: "reorder", question: "Negotiation steps:", items: ["Anchor with research", "Listen", "Thank them", "Prepare alternatives"], correctOrder: [2, 0, 1, 3], explanation: "Thank → research anchor → listen → alternatives." },
      { type: "fill-blank", question: "You don't get what you don't _______.", correct: ["ask for", "negotiate"], explanation: "Asking is the first step — most people are open to it." },
      { type: "reflection", question: "What's something you want to negotiate (pay, title, flexibility)? What research supports it?", minChars: 50, explanation: "Preparation builds confidence in negotiation." }
    ]
  },
  {
    id: "car-10",
    title: "Leading Without a Title",
    unit: 4,
    unitName: "Leadership",
    exercises: [
      { type: "multiple-choice", question: "Leadership is about...", options: ["Having a manager title", "Influence and taking responsibility, no matter your role", "Bossing people around", "Being in charge"], correct: 1, explanation: "Anyone can lead from any role." },
      { type: "true-false", statement: "You need permission to lead.", correct: false, explanation: "Informal leadership often matters more than formal authority." },
      { type: "scenario", question: "Your team has a recurring problem no one fixes. What's a leaderly move?", options: ["Wait for manager to handle it", "Propose a simple solution and volunteer to test it", "Complain about it", "Ignore it"], correct: 1, explanation: "Solutions and initiative are leadership." },
      { type: "reorder", question: "Lead without title steps:", items: ["Take initiative", "See problems as opportunities", "Help others", "Own your work"], correctOrder: [1, 3, 0, 2], explanation: "Opportunity mindset → own work → initiative → help others." },
      { type: "fill-blank", question: "Leaders focus on _______, not blame.", correct: ["solutions", "progress", "improvement"], explanation: "Solution-oriented thinking drives change." },
      { type: "reflection", question: "Where could you show more leadership in your current role, even without a title?", minChars: 50, explanation: "Small acts of leadership compound." }
    ]
  },
  {
    id: "car-11",
    title: "Decision Making Under Pressure",
    unit: 4,
    unitName: "Leadership",
    exercises: [
      { type: "multiple-choice", question: "When under pressure, first...", options: ["Make a snap decision", "Pause and ground yourself", "Panic", "Ask everyone immediately"], correct: 1, explanation: "Calm mind makes better decisions." },
      { type: "true-false", statement: "Good decisions always take lots of time.", correct: false, explanation: "Many decisions can be made quickly with 70% information." },
      { type: "scenario", question: "You have to pick between two projects in 30 minutes. What framework helps?", options: ["Coin flip", "Pros/cons + alignment with goals", "Wait for more info", "Pick the one your friend likes"], correct: 1, explanation: "Even quick pros/cons with goals avoids randomness." },
      { type: "reorder", question: "Decision steps under pressure:", items: ["Make decision", "Evaluate options", "Clarify goal", "Calm yourself"], correctOrder: [3, 2, 1, 0], explanation: "Calm → goal → options → decide." },
      { type: "fill-blank", question: "Most decisions are reversible, so don't let _______ stop you.", correct: ["perfection", "fear", "overthinking"], explanation: "You can course-correct later." },
      { type: "reflection", question: "What's a high-pressure decision you faced? What helped (or didn't)?", minChars: 50, explanation: "Reflecting builds your decision muscle." }
    ]
  },
  {
    id: "car-12",
    title: "Giving & Receiving Feedback",
    unit: 4,
    unitName: "Leadership",
    exercises: [
      { type: "multiple-choice", question: "The best feedback is...", options: ["Once a year", "Timely, specific, and kind", "Only positive", "Delivered angrily"], correct: 1, explanation: "Feedback works best when given close to the event." },
      { type: "true-false", statement: "Only managers should give feedback.", correct: false, explanation: "360 feedback (up, down, peers) is most valuable." },
      { type: "scenario", question: "Peer's presentation had great visuals but was hard to follow. Good feedback?", options: ["It was bad", 'Loved your clear visuals! One idea: next time, maybe add a quick agenda up top? I found it hard to follow the structure', "Say nothing", "Talk behind their back"], correct: 1, explanation: "Specific positive plus kind, actionable suggestion." },
      { type: "reorder", question: "Giving good feedback:", items: ["Specific action", "Kind delivery", "Timely", "Impact"], correctOrder: [2, 0, 3, 1], explanation: "Timely → specific action → impact → kind delivery." },
      { type: "fill-blank", question: "Feedback is a _______, not a one-way street.", correct: ["gift", "conversation", "two-way"], explanation: "Give and receive well." },
      { type: "reflection", question: "What feedback do you wish you got more of? How could you ask for it?", minChars: 50, explanation: "Asking for specific feedback makes it easier to receive." }
    ]
  },
  {
    id: "car-13",
    title: "Embracing Failure",
    unit: 5,
    unitName: "Growth Mindset",
    exercises: [
      { type: "multiple-choice", question: "Failure is...", options: ["The end", "Data and learning", "Proof you're bad", "Something to hide"], correct: 1, explanation: "As before — failure is information, not identity." },
      { type: "true-false", statement: "Smart people don't fail.", correct: false, explanation: "Everyone fails; successful people learn from it faster." },
      { type: "scenario", question: "Your project fails spectacularly. What do you put in your 'failure resume'?", options: ["Nothing, hide it", "What happened, what you learned, what you'd do differently", "Blame others", "Pretend it never happened"], correct: 1, explanation: "A failure resume turns shame into learning." },
      { type: "reorder", question: "Extract learning from failure:", items: ["Document", "Find lesson", "Feel feelings", "Plan next time"], correctOrder: [2, 0, 1, 3], explanation: "Feel → document → lesson → plan." },
      { type: "fill-blank", question: "Fail _______, fail fast.", correct: ["forward", "early", "small"], explanation: "Fail cheap, learn fast." },
      { type: "reflection", question: "What's your biggest career 'failure' — and what did it teach you?", minChars: 50, explanation: "Reframing gives failure purpose." }
    ]
  },
  {
    id: "car-14",
    title: "Continuous Learning",
    unit: 5,
    unitName: "Growth Mindset",
    exercises: [
      { type: "multiple-choice", question: "The best learning happens through...", options: ["Only formal education", "Doing, reflecting, and iterating", "Watching YouTube", "Reading tweets"], correct: 1, explanation: "Experience + reflection = deep learning." },
      { type: "true-false", statement: "Learning stops when you graduate.", correct: false, explanation: "Lifelong learning is essential in fast-changing fields." },
      { type: "scenario", question: "You want to learn data analysis. What's the best approach?", options: ["Buy a course and never start", "Do a small project using free tutorials immediately", "Read 10 books first", "Wait for perfect time"], correct: 1, explanation: "Project-based learning is most effective." },
      { type: "reorder", question: "Learning loop steps:", items: ["Iterate", "Reflect", "Do", "Learn"], correctOrder: [3, 2, 0, 1], explanation: "Learn → do → reflect → iterate." },
      { type: "fill-blank", question: "Stay _______ — the world keeps changing.", correct: ["curious", "learning", "growing"], explanation: "Curiosity is fuel for growth." },
      { type: "reflection", question: "What do you want to learn next? What's one tiny step you can take this week?", minChars: 50, explanation: "Small steps are sustainable." }
    ]
  },
  {
    id: "car-15",
    title: "Building Your Career Moat",
    unit: 5,
    unitName: "Growth Mindset",
    exercises: [
      { type: "multiple-choice", question: "A career moat is...", options: ["A literal trench", "What makes you hard to replace", "Money in the bank", "A fancy job title"], correct: 1, explanation: "Unique combination of skills, relationships, and reputation." },
      { type: "true-false", statement: "Your moat stays the same forever.", correct: false, explanation: "You have to keep building and adapting your moat." },
      { type: "scenario", question: "You want a strong moat in marketing. What builds it best?", options: ["Just do your job", "Specialize in a niche + build an audience of your work", "Copy others", "Do the minimum"], correct: 1, explanation: "Niche expertise + personal brand = strong moat." },
      { type: "reorder", question: "Build career moat:", items: ["Document your work", "Specialize", "Build relationships", "Develop unique skills"], correctOrder: [3, 1, 0, 2], explanation: "Unique skills → specialize → document → relationships." },
      { type: "fill-blank", question: "Your moat protects you from _______.", correct: ["competition", "layoffs", "uncertainty"], explanation: "A strong moat gives you safety and options." },
      { type: "reflection", question: "What's already unique about your background/skills? How can you build on that?", minChars: 50, explanation: "Your unique story is the start of your moat." }
    ]
  }
];

// ------------------------------
// 💪 FITNESS LESSONS
// ------------------------------
const fitnessLessons = [
  {
    id: "fit-1",
    title: "Why Exercise Changes Your Brain",
    unit: 1,
    unitName: "Movement Foundations",
    exercises: [
      { type: "multiple-choice", question: "Exercise boosts which brain chemicals?", options: ["Only adrenaline", "Endorphins, dopamine, serotonin, BDNF", "Just cortisol", "Nothing"], correct: 1, explanation: "BDNF (brain-derived neurotrophic factor) is like Miracle-Gro for your brain." },
      { type: "true-false", statement: "You need to run a marathon to get mental benefits.", correct: false, explanation: "Even 10-20 minutes of movement boosts mood and focus." },
      { type: "scenario", question: "You're feeling anxious and unfocused. What's the best 15-minute fix?", options: ["Scroll social media", "A brisk walk outside", "Eat more sugar", "Take a nap"], correct: 1, explanation: "Outside walking = fresh air + movement + sunlight = triple win." },
      { type: "reorder", question: "Brain benefits order:", items: ["Better sleep", "Better focus", "Elevated mood"], correctOrder: [2, 1, 0], explanation: "Mood first, focus, then sleep (which amplifies everything)." },
      { type: "fill-blank", question: "Movement is medicine for your _______.", correct: ["brain", "mind", "body"], explanation: "Physical and mental health are deeply connected." },
      { type: "reflection", question: "When do you feel best after moving? What activity was it?", minChars: 50, explanation: "Notice what your body loves." }
    ]
  },
  {
    id: "fit-2",
    title: "Building a Sustainable Routine",
    unit: 1,
    unitName: "Movement Foundations",
    exercises: [
      { type: "multiple-choice", question: "The best exercise routine is...", options: ["The hardest one", "The one you'll actually do consistently", "Only gym workouts", "Whatever is trending"], correct: 1, explanation: "Sustainability beats intensity every time." },
      { type: "true-false", statement: "You have to workout 7 days a week to see results.", correct: false, explanation: "3-4 days/week consistently beats 7 days/week occasionally." },
      { type: "scenario", question: "You hate gyms. What's a good routine?", options: ["Give up", "Home bodyweight workouts + walks outside", "Force yourself to go to gym anyway", "Wait for motivation"], correct: 1, explanation: "Choose what fits your preferences, not ideals." },
      { type: "reorder", question: "Build routine steps:", items: ["Make it tiny", "Schedule it", "Track it", "Choose enjoyable"], correctOrder: [3, 1, 0, 2], explanation: "Choose enjoyable → schedule → tiny → track." },
      { type: "fill-blank", question: "Consistency beats _______.", correct: ["intensity", "perfection", "motivation"], explanation: "Small amounts done often win." },
      { type: "reflection", question: "What movement actually sounds fun to you? How can you make it easier to do?", minChars: 50, explanation: "Fun is the secret ingredient to consistency." }
    ]
  },
  {
    id: "fit-3",
    title: "The Big 3 Movement Patterns",
    unit: 1,
    unitName: "Movement Foundations",
    exercises: [
      { type: "multiple-choice", question: "Which is NOT a big 3 functional movement?", options: ["Push", "Pull", "Jump", "Hinge/Squat"], correct: 2, explanation: "Push, pull, squat/hinge, plus loaded carry — covers real-world movement." },
      { type: "true-false", statement: "You need fancy equipment to train big patterns.", correct: false, explanation: "Bodyweight, water bottles, backpacks work great." },
      { type: "scenario", question: "No equipment at home. How to train push/pull/squat?", options: ["Skip it", "Push-ups, towel rows, chair squats", "Wait for gym", "Only run"], correct: 1, explanation: "No equipment needed for effective training." },
      { type: "reorder", question: "Big 3 patterns:", items: ["Push", "Pull", "Squat/hinge"], correctOrder: [0, 1, 2], explanation: "These train all major muscle groups." },
      { type: "fill-blank", question: "Functional movement prepares you for _______.", correct: ["real life", "daily activities", "living"], explanation: "It's not just for looks — it's for capability." },
      { type: "reflection", question: "Which of these movements do you do most/least in daily life?", minChars: 50, explanation: "Balance your training with what you don't naturally do." }
    ]
  },
  {
    id: "fit-4",
    title: "Progressive Overload",
    unit: 2,
    unitName: "Training Science",
    exercises: [
      { type: "multiple-choice", question: "Progressive overload means...", options: ["Doing the same thing forever", "Gradually making workouts harder over time", "Lifting the heaviest weight immediately", "Working out longer"], correct: 1, explanation: "Your body adapts — you have to keep challenging it." },
      { type: "true-false", statement: "Progressive overload has to be adding weight.", correct: false, explanation: "More reps, better form, more sets, less rest — all count as overload." },
      { type: "scenario", question: "You did 3x10 push-ups last week. What's progressive overload?", options: ["Same thing", "3x11 push-ups or elevating feet slightly", "Stop doing push-ups", "Do less"], correct: 1, explanation: "Small progression is still progression." },
      { type: "reorder", question: "Ways to apply overload:", items: ["More reps", "More weight", "Better form", "More sets"], correctOrder: [2, 0, 3, 1], explanation: "Form first, then reps/sets, then weight." },
      { type: "fill-blank", question: "Overload is about _______ improvement.", correct: ["gradual", "small", "consistent"], explanation: "Big jumps lead to injury; small jumps lead to gains." },
      { type: "reflection", question: "How could you overload your current movement just a little next week?", minChars: 50, explanation: "Planning overload keeps you progressing." }
    ]
  },
  {
    id: "fit-5",
    title: "Rest & Recovery",
    unit: 2,
    unitName: "Training Science",
    exercises: [
      { type: "multiple-choice", question: "Muscles grow during...", options: ["Workouts", "Rest and recovery", "Immediately after", "Never"], correct: 1, explanation: "Workouts break you down; rest builds you back stronger." },
      { type: "true-false", statement: "More training is always better.", correct: false, explanation: "Overtraining leads to injury, fatigue, and burnout." },
      { type: "scenario", question: "You're sore for days and exhausted. What should you do?", options: ["Push through", "Active recovery: light walk/stretch, extra sleep", "Stop moving forever", "Train harder"], correct: 1, explanation: "Active recovery boosts blood flow without adding stress." },
      { type: "reorder", question: "Recovery tools:", items: ["Sleep", "Light movement", "Nutrition", "Stretch/foam roll"], correctOrder: [0, 2, 3, 1], explanation: "Sleep #1, nutrition, then mobility/movement." },
      { type: "fill-blank", question: "Rest is part of the _______.", correct: ["workout", "training", "plan"], explanation: "Recovery is active training, not passive doing nothing." },
      { type: "reflection", question: "How rested are you really? What could you do this week to recover better?", minChars: 50, explanation: "Most people underestimate how much recovery they need." }
    ]
  },
  {
    id: "fit-6",
    title: "Avoiding Injury",
    unit: 2,
    unitName: "Training Science",
    exercises: [
      { type: "multiple-choice", question: "Most injuries come from...", options: ["Bad luck", "Too much too soon and poor form", "Weights being dangerous", "Being old"], correct: 1, explanation: "Volume spikes and bad form are the main culprits." },
      { type: "true-false", statement: "Pain means you're making gains.", correct: false, explanation: "Sharp pain = stop; muscle burn = okay. Know the difference." },
      { type: "scenario", question: "You feel a sharp pain in your knee mid-squat. What to do?", options: ["Power through", "Stop immediately, rest, assess, modify next time", "Just ignore it", "Squat deeper"], correct: 1, explanation: "Pain is your body's warning system." },
      { type: "reorder", question: "Injury prevention steps:", items: ["Warm up", "Progress slow", "Good form", "Listen to body"], correctOrder: [0, 2, 1, 3], explanation: "Warm up → form → slow progression → listen to body." },
      { type: "fill-blank", question: "_______ is your best injury prevention tool.", correct: ["form", "listening", "patience"], explanation: "Perfect form prevents most issues." },
      { type: "reflection", question: "Have you had an injury before? What did you learn from it?", minChars: 50, explanation: "Past injuries teach you your limits and how to protect yourself." }
    ]
  },
  {
    id: "fit-7",
    title: "Macronutrients Explained",
    unit: 3,
    unitName: "Nutrition",
    exercises: [
      { type: "multiple-choice", question: "The three macronutrients are:", options: ["Vitamins, minerals, water", "Protein, carbs, fat", "Sugar, salt, fat", "Meat, veggies, fruit"], correct: 1, explanation: "Protein builds, carbs fuel, fats support hormones." },
      { type: "true-false", statement: "Fat makes you fat.", correct: false, explanation: "Dietary fat is essential — excess calories (any type) cause weight gain." },
      { type: "scenario", question: "You need a post-workout meal with protein and carbs. What fits?", options: ["Only salad", "Greek yogurt + berries + granola", "Soda", "Nothing"], correct: 1, explanation: "Protein + carbs = good recovery combo." },
      { type: "reorder", question: "Macros role order for training:", items: ["Protein", "Carbs", "Fats"], correctOrder: [0, 1, 2], explanation: "Protein for repair, carbs for energy, fats for health." },
      { type: "fill-blank", question: "Protein builds and repairs _______.", correct: ["muscle", "tissue"], explanation: "Protein is the building block." },
      { type: "reflection", question: "What's your current diet like? Where could you adjust macros slightly for better energy?", minChars: 50, explanation: "Small, realistic changes stick best." }
    ]
  },
  {
    id: "fit-8",
    title: "Eating for Energy",
    unit: 3,
    unitName: "Nutrition",
    exercises: [
      { type: "multiple-choice", question: "For steady energy, eat meals with...", options: ["Only sugar", "Protein + fiber + healthy fat", "Just carbs", "Skip meals"], correct: 1, explanation: "Balanced meals prevent blood sugar spikes and crashes." },
      { type: "true-false", statement: "Caffeine fixes tiredness from bad nutrition.", correct: false, explanation: "Caffeine masks fatigue — fix the root with food/sleep." },
      { type: "scenario", question: "You crash every afternoon. What breakfast change might help?", options: ["Skip breakfast", "Sugary cereal", "Oatmeal with peanut butter and banana", "Coffee only"], correct: 2, explanation: "Fiber (oats) + fat (peanut butter) + carb (banana) = steady fuel." },
      { type: "reorder", question: "Energy eating tips:", items: ["Balanced meals", "Stay hydrated", "Avoid extreme hunger", "Limit sugar spikes"], correctOrder: [0, 3, 1, 2], explanation: "Balanced → avoid spikes → hydrate → don't get ravenous." },
      { type: "fill-blank", question: "Food is _______, not just fuel.", correct: ["information", "nourishment", "energy"], explanation: "Food sends signals to your hormones and brain." },
      { type: "reflection", question: "When do your energy levels dip? What food choices preceded that?", minChars: 50, explanation: "Tracking reveals patterns." }
    ]
  },
  {
    id: "fit-9",
    title: "Habits Over Diets",
    unit: 3,
    unitName: "Nutrition",
    exercises: [
      { type: "multiple-choice", question: "The best diet is...", options: ["The strictest one", "Sustainable eating habits you enjoy", "The newest trend", "Eliminating entire food groups"], correct: 1, explanation: "Diets fail; habits last." },
      { type: "true-false", statement: "You have to be 'perfect' with nutrition to see results.", correct: false, explanation: "80% good, 20% flexible works for long-term health." },
      { type: "scenario", question: "You want to eat more veggies. What's the best tiny habit?", options: ["Eat only veggies for a month", "Add one vegetable to dinner each night", "Make a huge salad every day", "Quit"], correct: 1, explanation: "Start tiny and automatic." },
      { type: "reorder", question: "Build eating habits:", items: ["Make it obvious", "Tiny first step", "Reward yourself", "Enjoy it"], correctOrder: [0, 1, 3, 2], explanation: "Obvious cue → tiny step → enjoy → reward." },
      { type: "fill-blank", question: "Habits shape your _______ over time.", correct: ["health", "body", "energy"], explanation: "Small daily choices add up." },
      { type: "reflection", question: "What's one tiny eating habit you can stick to for 30 days?", minChars: 50, explanation: "Tiny habits compound into huge change." }
    ]
  },
  {
    id: "fit-10",
    title: "Why Sleep Is Your Superpower",
    unit: 4,
    unitName: "Sleep",
    exercises: [
      { type: "multiple-choice", question: "During sleep, your body...", options: ["Shuts down completely", "Repairs muscle, consolidates memories, regulates hormones", "Only dreams", "Gains fat automatically"], correct: 1, explanation: "Sleep is when your body does most of its recovery work." },
      { type: "true-false", statement: "You can train your body to need less sleep.", correct: false, explanation: "Most adults need 7-9 hours — you can't 'get used to' less long-term." },
      { type: "scenario", question: "You sleep only 5 hours a night. What changes first?", options: ["Nothing", "Mood, focus, hunger hormones go haywire", "Gain 10 lbs immediately", "Superpowers"], correct: 1, explanation: "Sleep deprivation hits mental health and hunger regulation fast." },
      { type: "reorder", question: "Sleep benefits order:", items: ["Muscle recovery", "Mood stability", "Cognitive function"], correctOrder: [2, 1, 0], explanation: "You notice mood/focus first, then physical recovery." },
      { type: "fill-blank", question: "Sleep is the best _______ aid.", correct: ["recovery", "performance", "fitness"], explanation: "Nothing replaces sleep." },
      { type: "reflection", question: "What does a good night's sleep feel like for you? How can you create more of those?", minChars: 50, explanation: "Know what good feels like, then reverse-engineer the conditions." }
    ]
  },
  {
    id: "fit-11",
    title: "Fixing Your Sleep",
    unit: 4,
    unitName: "Sleep",
    exercises: [
      { type: "multiple-choice", question: "Good sleep starts with...", options: ["Falling asleep instantly", "Consistent sleep schedule and bedtime routine", "Lots of caffeine", "Phone in bed"], correct: 1, explanation: "Circadian rhythm loves consistency." },
      { type: "true-false", statement: "Watching TV in bed helps you sleep.", correct: false, explanation: "Blue light and stimulation delay melatonin release." },
      { type: "scenario", question: "You can't fall asleep. What to do?", options: ["Lie there stressing", "Get out of bed, do something boring in dim light until sleepy", "Scroll phone", "Eat a big meal"], correct: 1, explanation: "Break the association between bed and frustration." },
      { type: "reorder", question: "Bedtime routine steps:", items: ["Dim lights", "Avoid screens", "Wind down (read/stretch)", "Consistent time"], correctOrder: [3, 0, 1, 2], explanation: "Consistent time → dim → no screens → wind down." },
      { type: "fill-blank", question: "Your bedroom should be cool, dark, and _______.", correct: ["quiet", "comfortable", "boring"], explanation: "Optimal sleep environment conditions." },
      { type: "reflection", question: "What's one thing messing with your sleep? How can you remove it?", minChars: 50, explanation: "Remove sleep disruptors before trying fancy hacks." }
    ]
  },
  {
    id: "fit-12",
    title: "The Sleep-Performance Link",
    unit: 4,
    unitName: "Sleep",
    exercises: [
      { type: "multiple-choice", question: "Sleep improves fitness performance by:", options: ["Nothing", "Better reaction time, energy, muscle recovery, and motivation", "Only making you less tired", "Magic"], correct: 1, explanation: "Sleep affects almost every performance metric." },
      { type: "true-false", statement: "You can out-train bad sleep.", correct: false, explanation: "Sleep is foundational; poor sleep kills gains." },
      { type: "scenario", question: "You have a big workout tomorrow. What's the best prep?", options: ["Stay up late planning", "Get 7-9 hours of sleep tonight", "Drink extra coffee", "Eat a huge meal before bed"], correct: 1, explanation: "Sleep is the best performance enhancer." },
      { type: "reorder", question: "Sleep affects performance:", items: ["Recovery", "Energy", "Motivation", "Coordination"], correctOrder: [1, 3, 2, 0], explanation: "Energy first, coordination, motivation, then deep recovery." },
      { type: "fill-blank", question: "Sleep is performance-enhancing and _______.", correct: ["legal", "free", "safe"], explanation: "No side effects, all benefits." },
      { type: "reflection", question: "When have you felt the difference between good and bad sleep in a workout?", minChars: 50, explanation: "Personal experience makes the impact real." }
    ]
  },
  {
    id: "fit-13",
    title: "Identity-Based Fitness",
    unit: 5,
    unitName: "Consistency",
    exercises: [
      { type: "multiple-choice", question: "Identity-based habits focus on...", options: ["Outcomes only", 'Who you want to become ("I'm an active person")', "What you want to achieve", "Willpower"], correct: 1, explanation: "Outcome goals are fleeting; identity is lasting." },
      { type: "true-false", statement: "You have to feel motivated to act.", correct: false, explanation: "Act your way into new feelings; identity follows action." },
      { type: "scenario", question: "You want to be someone who works out consistently. What's an identity-based action?", options: ["Wait for motivation", "Put workout clothes on every morning, even if you don't feel like it", "Wait for perfect gym", "Quit"], correct: 1, explanation: "Small acts reinforce your new identity." },
      { type: "reorder", question: "Build identity-based habits:", items: ["Act the part", "Define who you want to be", "Small daily proofs"], correctOrder: [1, 0, 2], explanation: "Define → act → small proofs." },
      { type: "fill-blank", question: "Your identity is shaped by your _______.", correct: ["actions", "habits", "small choices"], explanation: "Every action is a vote for your identity." },
      { type: "reflection", question: "What kind of active person do you want to be? What's one tiny action that fits that?", minChars: 50, explanation: "Clarity on identity makes choices easy." }
    ]
  },
  {
    id: "fit-14",
    title: "Training When Unmotivated",
    unit: 5,
    unitName: "Consistency",
    exercises: [
      { type: "multiple-choice", question: "When unmotivated, best strategy is...", options: ["Quit", "Do 5 minutes of movement — anything counts", "Wait for motivation", "Push through a full workout anyway"], correct: 1, explanation: "Motion creates motivation; reduce the barrier to almost nothing." },
      { type: "true-false", statement: "Motivation comes before action.", correct: false, explanation: "Action comes first, then motivation follows." },
      { type: "scenario", question: "Zero motivation to workout. What to do?", options: ["Nothing", "Dance to 1 favorite song, then decide", "Force a 90-min workout", "Eat junk food instead"], correct: 1, explanation: "Minimum viable movement." },
      { type: "reorder", question: "Unmotivated steps:", items: ["Reduce friction", "Start 5 minutes", "Ask 'what's the smallest thing?'"], correctOrder: [2, 0, 1], explanation: "Smallest thing → reduce friction → 5 minutes." },
      { type: "fill-blank", question: "Don't rely on _______; rely on systems.", correct: ["motivation", "feelings", "inspiration"], explanation: "Systems work even when you don't feel like it." },
      { type: "reflection", question: "What's your 'minimum viable workout' for days you don't feel like it?", minChars: 50, explanation: "Define it beforehand so you don't decide in the moment." }
    ]
  },
  {
    id: "fit-15",
    title: "Your Long-Term Fitness Plan",
    unit: 5,
    unitName: "Consistency",
    exercises: [
      { type: "multiple-choice", question: "A long-term fitness plan should be...", options: ["Rigid and punishing", "Flexible, sustainable, and fun", "Only about aesthetics", "Impossible to follow"], correct: 1, explanation: "Life happens — plan needs to bend, not break." },
      { type: "true-false", statement: "Your fitness plan has to look like everyone else's.", correct: false, explanation: "Customize for your body, preferences, and life." },
      { type: "scenario", question: "You travel often for work. How to adjust?", options: ["Stop working out while traveling", "Plan hotel room workouts and walks — no equipment needed", "Wait till you're home", "Use travel as an excuse"], correct: 1, explanation: "Adapt your plan to your reality." },
      { type: "reorder", question: "Design your plan:", items: ["Plan adaptability", "Choose enjoyable", "Start tiny", "Track lightly"], correctOrder: [1, 2, 3, 0], explanation: "Enjoyable → tiny → light track → adaptable." },
      { type: "fill-blank", question: "Fitness is a _______, not a race.", correct: ["marathon", "journey", "lifestyle"], explanation: "Long-term consistency is the only thing that matters." },
      { type: "reflection", question: "What does fitness success look like for you in 5 years? How to build that slowly?", minChars: 50, explanation: "Long-term vision guides short-term choices." }
    ]
  }
];

// ------------------------------
// 💰 FINANCE LESSONS
// ------------------------------
const financeLessons = [
  {
    id: "fin-1",
    title: "Your Relationship With Money",
    unit: 1,
    unitName: "Money Mindset",
    exercises: [
      { type: "multiple-choice", question: "Your money mindset comes from...", options: ["Nothing — you're born with it", "Childhood experiences and messages about money", "Only your current bank account", "Luck"], correct: 1, explanation: "Our beliefs are shaped by what we saw growing up." },
      { type: "true-false", statement: "Money is inherently evil.", correct: false, explanation: "Money is a tool — it amplifies what's already there (good or bad)." },
      { type: "scenario", question: "You feel anxious whenever you check your bank account. First step?", options: ["Never check it", "Notice the feeling gently, then start small (check once a week calmly)", "Spend money to feel better", "Hide statements"], correct: 1, explanation: "Acknowledge emotions, then build gentle habits." },
      { type: "reorder", question: "Improve money mindset:", items: ["Notice old stories", "Educate yourself", "Practice gratitude", "Take small kind actions"], correctOrder: [0, 1, 2, 3], explanation: "Notice stories → educate → gratitude → kind small actions." },
      { type: "fill-blank", question: "Money is a _______, not a measure of worth.", correct: ["tool", "resource", "means"], explanation: "Your value isn't your net worth." },
      { type: "reflection", question: "What did your parents/caregivers teach you about money (explicitly or implicitly)?", minChars: 50, explanation: "Awareness of old scripts lets you rewrite them." }
    ]
  },
  {
    id: "fin-2",
    title: "Scarcity vs. Abundance Mindset",
    unit: 1,
    unitName: "Money Mindset",
    exercises: [
      { type: "multiple-choice", question: "Scarcity mindset thinks...", options: ['"There's more than enough"', '"There's never enough"', '"I can create value"', '"Money flows"'], correct: 1, explanation: "Scarcity is fear-based and contracting." },
      { type: "true-false", statement: "Abundance means you're rich now.", correct: false, explanation: "Abundance is a mindset of possibility and gratitude, not just net worth." },
      { type: "scenario", question: "A friend gets a promotion. Scarcity reaction vs abundance?", options: ["Resent them; Why not me? / Be happy for them, ask what they learned", "Ignore them / Be excited", "Quit / Work harder", "Nothing"], correct: 0, explanation: "Abundance celebrates others' wins as proof of possibility." },
      { type: "reorder", question: "Move from scarcity to abundance:", items: ["Gratitude practice", "Notice scarcity thoughts", "Add value first", "Reframe"], correctOrder: [1, 3, 0, 2], explanation: "Notice → reframe → gratitude → add value." },
      { type: "fill-blank", question: "Abundance is about _______, not just money.", correct: ["possibility", "generosity", "gratitude"], explanation: "Abundance of time, relationships, joy too." },
      { type: "reflection", question: "When do you feel scarcity most? How could you shift your perspective?", minChars: 50, explanation: "Scarcity triggers are clues to what you value." }
    ]
  },
  {
    id: "fin-3",
    title: "Common Money Mistakes",
    unit: 1,
    unitName: "Money Mindset",
    exercises: [
      { type: "multiple-choice", question: "The biggest money mistake is...", options: ["Not having a budget", "Not investing early enough", "Lifestyle inflation", "All are big"], correct: 3, explanation: "All are critical — especially letting spending rise with income." },
      { type: "true-false", statement: "More income solves all money problems.", correct: false, explanation: "Without good habits, more income just becomes more spending." },
      { type: "scenario", question: "You get a raise. What's a smart move?", options: ["Immediately upgrade everything", "Keep lifestyle same, increase saving/investing by the raise amount", "Quit your job", "Spend it all"], correct: 1, explanation: "Avoid lifestyle inflation — invest the difference." },
      { type: "reorder", question: "Avoid common mistakes:", items: ["Live below means", "Don't try to time the market", "Avoid high-interest debt", "Invest early"], correctOrder: [2, 0, 3, 1], explanation: "Avoid bad debt first → live below → invest early → don't time market." },
      { type: "fill-blank", question: "Lifestyle inflation silently eats your _______.", correct: ["progress", "savings", "wealth"], explanation: "It creeps up and robs your future." },
      { type: "reflection", question: "What money mistakes have you made? What did they teach you?", minChars: 50, explanation: "Mistakes are the best teachers if you learn from them." }
    ]
  },
  {
    id: "fin-4",
    title: "Track Every Euro",
    unit: 2,
    unitName: "Budgeting",
    exercises: [
      { type: "multiple-choice", question: "Tracking money helps you...", options: ["Judge yourself", "See where it's actually going", "Feel guilty", "Spend more"], correct: 1, explanation: "Awareness is the first step to control." },
      { type: "true-false", statement: "Tracking has to be complicated and perfect.", correct: false, explanation: "Simple tracking is better than perfect tracking you don't do." },
      { type: "scenario", question: "You've never tracked spending. Best start?", options: ["Give up", "Track every cent for just 1 week to see", "Wait for perfect app", "Estimate"], correct: 1, explanation: "Start tiny and low-stakes." },
      { type: "reorder", question: "How to start tracking:", items: ["Choose simple tool", "Do it daily", "Review weekly"], correctOrder: [0, 1, 2], explanation: "Tool → daily → review." },
      { type: "fill-blank", question: "What gets _______ gets managed.", correct: ["tracked", "measured", "noticed"], explanation: "Peter Drucker classic — true for money too." },
      { type: "reflection", question: "What spending category surprises you most when you look closely?", minChars: 50, explanation: "Surprises reveal opportunities for better alignment." }
    ]
  },
  {
    id: "fin-5",
    title: "The 50/30/20 Rule",
    unit: 2,
    unitName: "Budgeting",
    exercises: [
      { type: "multiple-choice", question: "The 50/30/20 rule splits income into:", options: ["50% fun, 30% bills, 20% savings", "50% needs, 30% wants, 20% savings/debt", "50% savings, 30% needs, 20% wants", "Equal parts"], correct: 1, explanation: "Needs, wants, financial goals — simple framework." },
      { type: "true-false", statement: "You have to follow 50/30/20 exactly.", correct: false, explanation: "It's a guideline, not a prison — adjust to your life." },
      { type: "scenario", question: "Your rent is high (60% needs). Best adjustment?", options: ["Panic", "Trim a little from wants to get as close as possible, and make a plan to increase income long-term", "Give up", "Stop saving"], correct: 1, explanation: "Compensate where you can, don't abandon the framework entirely." },
      { type: "reorder", question: "Allocate 50/30/20:", items: ["Wants", "Needs", "Savings/debt"], correctOrder: [1, 0, 2], explanation: "Prioritize needs first, then savings/debt (pay yourself first!), then wants." },
      { type: "fill-blank", question: "Pay _______ first.", correct: ["yourself", "savings", "debt"], explanation: "Automate your future first before spending on now." },
      { type: "reflection", question: "Where does your money currently go? How could you shift it closer to 50/30/20?", minChars: 50, explanation: "Knowing your current split makes the goal concrete." }
    ]
  },
  {
    id: "fin-6",
    title: "Cutting Without Suffering",
    unit: 2,
    unitName: "Budgeting",
    exercises: [
      { type: "multiple-choice", question: "Best way to cut spending:", options: ["Cut everything you enjoy", "Cut things that don't bring you joy, keep what does", "Never spend money", "Only buy generic"], correct: 1, explanation: "Value-based spending = cut waste, keep joy." },
      { type: "true-false", statement: "Budgeting means deprivation.", correct: false, explanation: "Budgeting means intentional spending on what matters." },
      { type: "scenario", question: "You subscribe to 5 streaming services but only use 1. What to do?", options: ["Keep all out of habit", "Cancel 4, maybe rotate if you miss them", "Keep 2 more just in case", "Get more"], correct: 1, explanation: "Subscriptions are silent budget killers." },
      { type: "reorder", question: "Value-based spending steps:", items: ["Keep what brings joy", "Cut the rest", "Ask 'does this bring value?'"], correctOrder: [2, 0, 1], explanation: "Ask → keep → cut." },
      { type: "fill-blank", question: "Spend on your _______, not someone else's.", correct: ["values", "priorities", "joy"], explanation: "Stop comparing and spend on what you care about." },
      { type: "reflection", question: "What spending brings you the most joy? What feels like a total waste?", minChars: 50, explanation: "Clarify your values to make spending easier." }
    ]
  },
  {
    id: "fin-7",
    title: "Why an Emergency Fund Saves Lives",
    unit: 3,
    unitName: "Saving & Emergency Fund",
    exercises: [
      { type: "multiple-choice", question: "Your emergency fund should cover:", options: ["Nothing", "3-6 months of essential expenses", "1 year of everything", "1 month"], correct: 1, explanation: "3-6 months is the sweet spot for most people." },
      { type: "true-false", statement: "You should invest your emergency fund for high returns.", correct: false, explanation: "Emergency fund needs to be safe and accessible — high-yield savings account only." },
      { type: "scenario", question: "Your car breaks down unexpectedly. If you have an emergency fund, you...", options: ["Go into credit card debt", "Pay cash from the fund, then refill it", "Ignore it", "Sell something"], correct: 1, explanation: "Emergency fund turns crises into inconveniences." },
      { type: "reorder", question: "Build emergency fund steps:", items: ["Start tiny ($500/$1000)", "Automate transfers", "Keep it accessible", "Build to 3-6 months"], correctOrder: [0, 1, 2, 3], explanation: "Tiny buffer → automate → accessible → full 3-6 months." },
      { type: "fill-blank", question: "Emergency fund is your financial _______.", correct: ["safety net", "airbag", "buffer"], explanation: "It catches you when life happens." },
      { type: "reflection", question: "What would an emergency fund give you (peace of mind? options?)?", minChars: 50, explanation: "Understanding the emotional benefit motivates saving." }
    ]
  },
  {
    id: "fin-8",
    title: "Automating Your Savings",
    unit: 3,
    unitName: "Saving & Emergency Fund",
    exercises: [
      { type: "multiple-choice", question: "Automation works because...", options: ["It's magic", "It removes willpower from the equation", "Robots are smarter", "You forget about it"], correct: 1, explanation: "Pay yourself first automatically before you see the money." },
      { type: "true-false", statement: "You have to manually transfer money every month.", correct: false, explanation: "Set it up once and let systems run." },
      { type: "scenario", question: "You want to save $200/month. Best way?", options: ["Wait to see what's left at month end", "Automate $200 transfer to savings the day after payday", "Try your best", "Save only extra"], correct: 1, explanation: "Automatic transfers on payday eliminate choice friction." },
      { type: "reorder", question: "Automate your finances:", items: ["Bills auto-pay", "Investments auto-contribute", "Savings auto-transfer"], correctOrder: [2, 0, 1], explanation: "Pay yourself/savings first, then bills, then investments." },
      { type: "fill-blank", question: "Automate the _______ things.", correct: ["important", "boring", "critical"], explanation: "Important but boring tasks are perfect for automation." },
      { type: "reflection", question: "What's one financial task you could automate this week?", minChars: 50, explanation: "Start small with one automation and build." }
    ]
  },
  {
    id: "fin-9",
    title: "Short vs. Long-Term Goals",
    unit: 3,
    unitName: "Saving & Emergency Fund",
    exercises: [
      { type: "multiple-choice", question: "Money for goals within 3 years should be:", options: ["Invested in stocks", "In safe, accessible places (high-yield savings)", "Under mattress", "Spent"], correct: 1, explanation: "Short-term = safety and liquidity; long-term = growth." },
      { type: "true-false", statement: "You should use the same account for all goals.", correct: false, explanation: "Separate accounts for separate goals prevent dipping." },
      { type: "scenario", question: "You're saving for a vacation next year AND retirement 30 years from now. Where does each go?", options: ["Both stocks", "Vacation in savings; retirement in investments", "Both under mattress", "Vacation in stocks; retirement in savings"], correct: 1, explanation: "Match account type to timeline." },
      { type: "reorder", question: "Goal timeline matching:", items: ["Retirement (20+ yrs)", "Emergency fund (now)", "Vacation (1 yr)"], correctOrder: [1, 2, 0], explanation: "Emergency first, short-term, then long-term retirement." },
      { type: "fill-blank", question: "Short-term = safety; long-term = _______.", correct: ["growth", "risk", "stocks"], explanation: "Time horizon determines strategy." },
      { type: "reflection", question: "What are your 3 financial goals? Sort them by timeline.", minChars: 50, explanation: "Sorting goals clarifies where each should live." }
    ]
  },
  {
    id: "fin-10",
    title: "Investing 101",
    unit: 4,
    unitName: "Investing",
    exercises: [
      { type: "multiple-choice", question: "The best investment strategy for most people is:", options: ["Pick individual stocks", "Low-cost broad index funds/ETFs held long-term", "Day trading", "Crypto only"], correct: 1, explanation: "Simple, low-cost, diversified, long-term beats most professional investors." },
      { type: "true-false", statement: "You need a lot of money to start investing.", correct: false, explanation: "You can start with $5/$10/month now — time matters more than starting amount." },
      { type: "scenario", question: "You have $100/month to invest. What to do?", options: ["Save till you have $1000 then start", "Start now with low-cost index funds, $100/month auto-contribution", "Gamble it", "Wait for perfect time"], correct: 1, explanation: "Compounding loves time — start immediately." },
      { type: "reorder", question: "Start investing steps:", items: ["Low-cost index funds", "Open retirement account first if match", "Automate", "Start tiny"], correctOrder: [1, 0, 3, 2], explanation: "Take free match first → low-cost index → start tiny → automate." },
      { type: "fill-blank", question: "Time in the market beats _______ the market.", correct: ["timing", "beating"], explanation: "Consistency > timing attempts." },
      { type: "reflection", question: "What scares you about investing? What could you learn to reduce that fear?", minChars: 50, explanation: "Education reduces fear; fear comes from the unknown." }
    ]
  },
  {
    id: "fin-11",
    title: "Compound Interest — The 8th Wonder",
    unit: 4,
    unitName: "Investing",
    exercises: [
      { type: "multiple-choice", question: "Compound interest works best with:", options: ["Lots of money only", "Time and regular contributions", "High risk", "Luck"], correct: 1, explanation: "Compound growth is exponential — time is your biggest asset." },
      { type: "true-false", statement: "Starting at 25 vs 35 doesn't make a big difference.", correct: false, explanation: "That 10-year head start is often worth more than extra contributions later." },
      { type: "scenario", question: "Person A starts at 25 with $100/month. Person B starts at 35 with $200/month. Both to 65. Who has more?", options: ["Person B", "Person A, because of 10 extra years of compounding", "Same", "Neither"], correct: 1, explanation: "Time is more powerful than amount early on." },
      { type: "reorder", question: "Keys to compounding:", items: ["Regular contributions", "Long time horizon", "Don't interrupt"], correctOrder: [1, 0, 2], explanation: "Time first, then regular contributions, then leave it alone." },
      { type: "fill-blank", question: "Compound interest is interest on _______.", correct: ["interest", "previous growth"], explanation: "Growth builds on growth." },
      { type: "reflection", question: "Calculate (roughly) what you could have if you start now — does it motivate you?", minChars: 50, explanation: "Seeing the numbers makes compounding real." }
    ]
  },
  {
    id: "fin-12",
    title: "Index Funds for Beginners",
    unit: 4,
    unitName: "Investing",
    exercises: [
      { type: "multiple-choice", question: "An index fund:", options: ["Beats the market always", "Tracks an entire market (like S&P 500) at low cost", "Is risky", "Only for rich people"], correct: 1, explanation: "Broad index funds give you the entire market return, diversified, low fees." },
      { type: "true-false", statement: "You have to beat the market to be successful.", correct: false, explanation: "Simply matching the market over time puts you ahead of 80% of professionals after fees." },
      { type: "scenario", question: "You want to invest simply. What's a good single choice?", options: ["One expensive active mutual fund", "A low-cost total world stock market index fund", "One random stock", "All cash"], correct: 1, explanation: "Total world market is diversified and simple." },
      { type: "reorder", question: "Index fund benefits order:", items: ["Low fees", "Diversified", "Simple"], correctOrder: [2, 1, 0], explanation: "Simple first, then diversified, then low fees are icing." },
      { type: "fill-blank", question: "Index funds are for _______ term.", correct: ["long", "patient"], explanation: "Hold them through ups and downs." },
      { type: "reflection", question: "Does simple index investing sound boring? Is that okay with you?", minChars: 50, explanation: "Boring is often profitable in investing." }
    ]
  },
  {
    id: "fin-13",
    title: "Eliminating Bad Debt",
    unit: 5,
    unitName: "Financial Freedom",
    exercises: [
      { type: "multiple-choice", question: "Bad debt is debt that...", options: ["All debt is bad", "Has high interest (10%+) and doesn't build value", "Mortgage only", "Student loans only"], correct: 1, explanation: "High-interest debt is a guaranteed negative return; attack it first." },
      { type: "true-false", statement: "You should always pay minimums only.", correct: false, explanation: "Avalanche (highest interest first) saves the most money mathematically." },
      { type: "scenario", question: "You have 20% credit card debt and 5% student loans. Which to put extra towards first?", options: ["Student loans", "Credit card", "Split extra equally", "Neither"], correct: 1, explanation: "Avalanche method — mathematically optimal." },
      { type: "reorder", question: "Debt payoff order (avalanche):", items: ["Minimums on all", "Highest interest first", "Celebrate wins"], correctOrder: [0, 1, 2], explanation: "Minimums first, then attack highest interest, celebrate each payoff." },
      { type: "fill-blank", question: "Paying off high-interest debt is a guaranteed _______.", correct: ["return", "win", "investment"], explanation: "Guaranteed return equal to the interest rate." },
      { type: "reflection", question: "What's your bad debt? What's your plan to eliminate it?", minChars: 50, explanation: "Clear plan makes the debt feel conquerable." }
    ]
  },
  {
    id: "fin-14",
    title: "Building Multiple Income Streams",
    unit: 5,
    unitName: "Financial Freedom",
    exercises: [
      { type: "multiple-choice", question: "Best first income stream for most people:", options: ["Quit job and start a business", "Improve your career/earnings at current job first", "Day trading", "Rent out your house immediately"], correct: 1, explanation: "Your career is often the highest ROI income stream." },
      { type: "true-false", statement: "Side hustles have to be miserable and take all your time.", correct: false, explanation: "Start small with something that fits your skills and life." },
      { type: "scenario", question: "You want a side hustle but are busy. Best first step?", options: ["Big business idea", "Sell one skill you already have for a few hours/month", "Quit", "Spend money first"], correct: 1, explanation: "Monetize existing skills before building something new." },
      { type: "reorder", question: "Build income streams:", items: ["Career first", "Monetize existing skills", "Invest for passive income later"], correctOrder: [0, 1, 2], explanation: "Career first, then skills, then passive from investments." },
      { type: "fill-blank", question: "Your best asset is your _______.", correct: ["skills", "time", "earning ability"], explanation: "You can always improve your earning power." },
      { type: "reflection", question: "What skills do you already have that people might pay for?", minChars: 50, explanation: "Look at what you're already good at; that's your starting point." }
    ]
  },
  {
    id: "fin-15",
    title: "Your Financial Freedom Number",
    unit: 5,
    unitName: "Financial Freedom",
    exercises: [
      { type: "multiple-choice", question: "The 4% rule says you can withdraw:", options: ["10% forever", "4% of your portfolio in year 1, adjust for inflation, high chance of lasting 30+ years", "Nothing ever", "All of it"], correct: 1, explanation: "Common guideline for safe withdrawal rate in retirement." },
      { type: "true-false", statement: "Financial freedom means never working again.", correct: false, explanation: "Financial freedom means you work because you want to, not because you have to." },
      { type: "scenario", question: "Your annual spending is $40k. What's your FIRE number roughly?", options: ["$40k", "$1M (25x)", "$200k", "$4M"], correct: 1, explanation: "25x annual expenses is a common FIRE target." },
      { type: "reorder", question: "Calculate freedom number:", items: ["Track annual spending", "Multiply by 25", "See what's possible"], correctOrder: [0, 1, 2], explanation: "Track spending first, then multiply." },
      { type: "fill-blank", question: "Financial freedom is about _______, not just money.", correct: ["choice", "freedom", "control"], explanation: "It's about autonomy over your time." },
      { type: "reflection", question: "What would financial freedom look like for you? What would you do with your time?", minChars: 50, explanation: "The 'why' keeps you motivated during the 'how'." }
    ]
  }
];

// ------------------------------
// 🎨 HOBBIES LESSONS
// ------------------------------
const hobbiesLessons = [
  {
    id: "hob-1",
    title: "Why Hobbies Make You Better at Everything",
    unit: 1,
    unitName: "Finding Your Thing",
    exercises: [
      { type: "multiple-choice", question: "Hobbies help you by...", options: ["Wasting time", "Building creativity, resilience, and reducing stress", "Only making money", "Making you busy"], correct: 1, explanation: "Hobbies recharge your brain and build skills that spill over." },
      { type: "true-false", statement: "Hobbies are a luxury you don't have time for.", correct: false, explanation: "Hobbies are productive rest — they make you better at work and life." },
      { type: "scenario", question: "You're burnt out at work. What hobby might help?", options: ["More work", "Something tactile and low-stakes (pottery, gardening)", "No hobbies", "Scrolling"], correct: 1, explanation: "Hands-on, low-stakes activities reset stressed brains." },
      { type: "reorder", question: "Hobby benefits order:", items: ["Stress relief", "Creativity boost", "New skills"], correctOrder: [0, 1, 2], explanation: "Stress relief first, then creativity, then skills." },
      { type: "fill-blank", question: "Hobbies are not productive; they are _______.", correct: ["restorative", "essential", "recharging"], explanation: "They don't need to be productive to matter." },
      { type: "reflection", question: "What did you love doing as a kid that you've abandoned? Why?", minChars: 50, explanation: "Childhood joy is a clue to your adult hobbies." }
    ]
  },
  {
    id: "hob-2",
    title: "Exploring vs. Committing",
    unit: 1,
    unitName: "Finding Your Thing",
    exercises: [
      { type: "multiple-choice", question: "When starting out, better to...", options: ["Stick to one thing forever", "Explore lots of things for a while, then commit deeper to what sticks", "Commit immediately", "Never try anything"], correct: 1, explanation: "Exploration phase = no pressure, just curiosity." },
      { type: "true-false", statement: "You have to find your one 'true calling' hobby immediately.", correct: false, explanation: "You can have many hobbies; they change over time." },
      { type: "scenario", question: "You try painting and hate it; then guitar and it's just okay; then hiking and you love it. What to do?", options: ["Quit all hobbies", "Explore hiking more; it's okay painting/guitar weren't for you", "Force yourself to love painting", "Give up"], correct: 1, explanation: "Not every hobby clicks, and that's fine!" },
      { type: "reorder", question: "Find your hobby steps:", items: ["Explore widely", "Notice what sticks", "Dive deeper"], correctOrder: [0, 1, 2], explanation: "Wide exploration first, notice what feels good, then dive deeper." },
      { type: "fill-blank", question: "Exploration is about _______, not performance.", correct: ["curiosity", "fun", "play"], explanation: "No pressure to be good early on." },
      { type: "reflection", question: "What 3 things could you experiment with this month? No commitment needed.", minChars: 50, explanation: "Make exploration low-stakes and fun." }
    ]
  },
  {
    id: "hob-3",
    title: "Overcoming 'I'm Not Creative'",
    unit: 1,
    unitName: "Finding Your Thing",
    exercises: [
      { type: "multiple-choice", question: "Creativity is...", options: ["Only for artists", "A skill you can practice, not a talent you're born with", "Magic", "Only for kids"], correct: 1, explanation: "Everyone is creative; it just looks different." },
      { type: "true-false", statement: "You have to make 'good' art to be creative.", correct: false, explanation: "The process is the point; the product is secondary." },
      { type: "scenario", question: "You think you're not creative. Best first step?", options: ["Quit", "Do a 'bad art' day — intentionally make something terrible, no pressure", "Compare to pros", "Never try"], correct: 1, explanation: "Lowering the bar removes the pressure to be perfect." },
      { type: "reorder", question: "Build creativity steps:", items: ["Play without judgment", "Start tiny", "Practice regularly", "Steal like an artist (inspire)"] , correctOrder: [1, 0, 3, 2], explanation: "Tiny first, play without judgment, get inspired, practice." },
      { type: "fill-blank", question: "Creativity is a _______, not a gift.", correct: ["practice", "skill", "habit"], explanation: "It gets better with use." },
      { type: "reflection", question: "What's something you've called 'not creative' that actually is? How could you reframe it?", minChars: 50, explanation: "Reframing opens up possibilities." }
    ]
  },
  {
    id: "hob-4",
    title: "The Feynman Technique",
    unit: 2,
    unitName: "Learning Faster",
    exercises: [
      { type: "multiple-choice", question: "Feynman Technique is for...", options: ["Faking it", "Learning anything deeply by teaching it simply", "Memorizing facts", "Writing essays"], correct: 1, explanation: "If you can't teach it simply, you don't know it well enough." },
      { type: "true-false", statement: "You need an actual student to use Feynman.", correct: false, explanation: "Teach to a rubber duck, a wall, or write it simply — no real person needed." },
      { type: "scenario", question: "You're learning guitar chords. How to use Feynman?", options: ["Practice scales forever", "Explain chord theory to your pet in simple words, then fill gaps where you get stuck", "Quit when confused", "Watch videos only"], correct: 1, explanation: "Teaching reveals your gaps." },
      { type: "reorder", question: "Feynman steps:", items: ["Teach simply", "Identify gaps", "Organize & simplify", "Choose a topic"], correctOrder: [3,0,1,2], explanation: "Choose topic → teach → find gaps → organize." },
      { type: "fill-blank", question: "If you can't _______ it simply, you don't understand it.", correct: ["teach", "explain"], explanation: "Feynman's core insight." },
      { type: "reflection", question: "Pick something you're learning now. Try explaining it simply — what gaps did you find?", minChars: 50, explanation: "Gaps are your learning roadmap." }
    ]
  },
  {
    id: "hob-5",
    title: "Deliberate Practice",
    unit: 2,
    unitName: "Learning Faster",
    exercises: [
      { type: "multiple-choice", question: "Deliberate practice means...", options: ["Repeating what you're good at forever", "Focused work on your specific weaknesses with feedback", "Mindless repetition", "Practicing for hours without a goal"], correct: 1, explanation: "It's about targeted improvement, not just time spent." },
      { type: "true-false", statement: "Practicing your hobby means you're doing deliberate practice.", correct: false, explanation: "Mindless play is fun, but deliberate practice is focused on growth." },
      { type: "scenario", question: "You're learning to draw but your perspective is bad. What's deliberate practice?", options: ["Draw your favorite character again", "Do 10 perspective-only exercises daily, then get feedback", "Quit", "Only draw what's easy"], correct: 1, explanation: "Target the specific weakness directly." },
      { type: "reorder", question: "Deliberate practice steps:", items: ["Get feedback", "Focus on weak points", "Set clear goal", "Repeat"], correctOrder: [2,1,0,3], explanation: "Clear goal → target weakness → feedback → repeat." },
      { type: "fill-blank", question: "Deliberate practice is uncomfortable but _______.", correct: ["effective", "worth it"], explanation: "Growth lives at the edge of your comfort zone." },
      { type: "reflection", question: "What's the weakest part of your hobby? How could you practice just that this week?", minChars: 50, explanation: "Targeting weak points accelerates growth." }
    ]
  },
  {
    id: "hob-6",
    title: "Learning Plateaus",
    unit: 2,
    unitName: "Learning Faster",
    exercises: [
      { type: "multiple-choice", question: "Plateaus are...", options: ["Sign you're bad forever", "Normal part of learning — rest or switch approach", "Time to quit", "Permanent"], correct: 1, explanation: "Plateaus are when your brain is consolidating learning behind the scenes." },
      { type: "true-false", statement: "You're not improving when you're on a plateau.", correct: false, explanation: "You're consolidating — improvement is hidden for a while." },
      { type: "scenario", question: "You hit a plateau in piano; scales feel stuck. What to do?", options: ["Quit", "Switch approach temporarily — play a fun song, learn music theory, or take a short break", "Practice scales 8 hours a day", "Get frustrated"], correct: 1, explanation: "Switching things up or resting breaks plateaus." },
      { type: "reorder", question: "Break through plateau:", items: ["Take a short break", "Try a new approach", "Get feedback", "Trust the process"], correctOrder: [0,1,2,3], explanation: "Rest first, try new approach, get feedback, trust." },
      { type: "fill-blank", question: "Plateaus are where learning _______.", correct: ["consolidates", "deepens", "sticks"], explanation: "Hidden growth happens here." },
      { type: "reflection", question: "When have you hit a plateau before? What eventually got you past it?", minChars: 50, explanation: "Past plateaus teach you how to handle future ones." }
    ]
  },
  {
    id: "hob-7",
    title: "What Is Flow State?",
    unit: 3,
    unitName: "Creative Flow",
    exercises: [
      { type: "multiple-choice", question: "Flow state is when...", options: ["You're bored", "You're fully immersed, time flies, and you feel great", "You're stressed", "You're multitasking"], correct: 1, explanation: "Optimal experience — the sweet spot between challenge and skill." },
      { type: "true-false", statement: "Flow only happens for artists.", correct: false, explanation: "Flow can happen in any activity with the right conditions." },
      { type: "scenario", question: "You want to get into flow with your hobby. What setup helps?", options: ["Phone nearby, lots of distractions", "No notifications, clear goal, challenge matching your skill", "TV on", "Try multiple things at once"], correct: 1, explanation: "Clear goal, no distractions, challenge/skill balance." },
      { type: "reorder", question: "Flow conditions:", items: ["Clear goals", "Immediate feedback", "Challenge-skill balance", "No distractions"], correctOrder: [3,0,2,1], explanation: "No distractions first, then goals, balance, feedback." },
      { type: "fill-blank", question: "Flow is the optimal _______.", correct: ["experience", "state"], explanation: "It's when we feel our best and perform our best." },
      { type: "reflection", question: "When were you last in flow? What were the conditions?", minChars: 50, explanation: "Know what works for you to recreate it." }
    ]
  },
  {
    id: "hob-8",
    title: "Designing Your Creative Environment",
    unit: 3,
    unitName: "Creative Flow",
    exercises: [
      { type: "multiple-choice", question: "Good creative environment...", options: ["Is perfect and beautiful", "Removes friction and has your tools visible", "Is messy always", "Is only in a studio"], correct: 1, explanation: "Make it easy to start; remove barriers." },
      { type: "true-false", statement: "You need a fancy space to be creative.", correct: false, explanation: "A dedicated corner works fine — it's about consistency, not perfection." },
      { type: "scenario", question: "You want to paint more but never start. What environmental tweak helps?", options: ["Hide supplies in closet", "Leave painting supplies set up on a small table, visible and ready to go", "Wait for perfect studio", "Buy more supplies first"], correct: 1, explanation: "Frictionless start makes it way easier to begin." },
      { type: "reorder", question: "Design your space:", items: ["Make it visible", "Remove friction", "Make it enjoyable", "Keep supplies ready"], correctOrder: [3,1,0,2], explanation: "Ready supplies → remove friction → visible → enjoyable." },
      { type: "fill-blank", question: "Environment designs your _______.", correct: ["behavior", "habits"], explanation: "Change the environment, change your actions." },
      { type: "reflection", question: "What friction is stopping you from doing your hobby? How to remove it?", minChars: 50, explanation: "Small environmental tweaks have huge impact." }
    ]
  },
  {
    id: "hob-9",
    title: "Overcoming Creative Blocks",
    unit: 3,
    unitName: "Creative Flow",
    exercises: [
      { type: "multiple-choice", question: "When blocked, best to...", options: ["Stare at blank page forever", "Do a completely different activity or create something tiny and bad", "Quit forever", "Wait for inspiration"], correct: 1, explanation: "Movement or tiny creation unlocks stuckness." },
      { type: "true-false", statement: "Creative blocks mean you're not talented.", correct: false, explanation: "Blocks are normal for everyone — it's just part of the process." },
      { type: "scenario", question: "Writer's block! You can't write anything. What to do?", options: ["Give up", "Write one terrible sentence, or write about nothing, or go for a walk", "Force a masterpiece", "Delete everything"], correct: 1, explanation: "Terrible first steps still count as steps." },
      { type: "reorder", question: "Unblock steps:", items: ["Create something tiny/bad", "Move your body", "Change environment", "Lower the bar completely"], correctOrder: [2,1,3,0], explanation: "Change environment → move → lower bar → tiny bad creation." },
      { type: "fill-blank", question: "Action inspires _______, not the other way around.", correct: ["inspiration", "motivation"], explanation: "Do something first; inspiration follows." },
      { type: "reflection", question: "What gets you unblocked? Make a personal unblock toolkit.", minChars: 50, explanation: "Your unblock methods are personal — know what works for you." }
    ]
  },
  {
    id: "hob-10",
    title: "Why Sharing Accelerates Growth",
    unit: 4,
    unitName: "Sharing Your Work",
    exercises: [
      { type: "multiple-choice", question: "Sharing your work helps because...", options: ["It's just for praise", "You get feedback, build accountability, and connect with others", "Only to show off", "It's scary"], correct: 1, explanation: "Sharing creates growth loops you can't get alone." },
      { type: "true-false", statement: "You should only share perfect work.", correct: false, explanation: "Share the process and imperfect work — that's where the learning and connection happens." },
      { type: "scenario", question: "You made an okay drawing. What to do with it?", options: ["Hide it forever", "Share it anyway, note what you learned", "Throw it away", "Redraw until perfect"], correct: 1, explanation: "Share early and often." },
      { type: "reorder", question: "Share your work:", items: ["Start small", "Share process not just results", "Embrace feedback", "Do it consistently"], correctOrder: [0,1,2,3], explanation: "Small first → share process → feedback → consistent." },
      { type: "fill-blank", question: "Share _______, not just products.", correct: ["process", "journey", "work in progress"], explanation: "Process is relatable and interesting." },
      { type: "reflection", question: "What scares you about sharing your work? What's the smallest share you could do anyway?", minChars: 50, explanation: "Small shares build courage." }
    ]
  },
  {
    id: "hob-11",
    title: "Handling Criticism of Your Work",
    unit: 4,
    unitName: "Sharing Your Work",
    exercises: [
      { type: "multiple-choice", question: "Good feedback vs. trolling:", options: ["All feedback is good", "Good feedback is specific and kind; trolling is about the person, not the work", "Ignore all feedback", "Only listen to praise"], correct: 1, explanation: "Separate useful feedback from noise." },
      { type: "true-false", statement: "Criticism means your work is bad.", correct: false, explanation: "Criticism is one person's opinion; you choose what to take." },
      { type: "scenario", question: "Someone leaves a mean comment on your shared work. What to do?", options: ["Take it personally and quit", "Thank any constructive parts, ignore the rest, disengage if needed", "Argue back", "Delete everything"], correct: 1, explanation: "Protect your peace; extract value if there is any, move on." },
      { type: "reorder", question: "Process feedback:", items: ["Separate self from work", "Extract useful parts", "Thank", "Let go of rest"], correctOrder: [0,2,1,3], explanation: "Separate identity first → thank → extract → let go." },
      { type: "fill-blank", question: "Your work is not your _______.", correct: ["identity", "worth", "self"], explanation: "Criticism of work ≠ criticism of you." },
      { type: "reflection", question: "What's one piece of feedback that actually helped you? How did you use it?", minChars: 50, explanation: "Good feedback is a gift." }
    ]
  },
  {
    id: "hob-12",
    title: "Building in Public",
    unit: 4,
    unitName: "Sharing Your Work",
    exercises: [
      { type: "multiple-choice", question: "Building in public means...", options: ["Showing off", "Sharing your learning journey openly, warts and all", "Only sharing perfect final products", "Copying others"], correct: 1, explanation: "Build in public = share progress, mistakes, learnings as you go." },
      { type: "true-false", statement: "You need a big audience to build in public.", correct: false, explanation: "Even an audience of 1 (or just your future self) counts." },
      { type: "scenario", question: "You want to build in public with your hobby. Best first move?", options: ["Wait till you're good", "Post one photo of your work in progress with one thing you learned", "Post perfect work only", "Start a big account"], correct: 1, explanation: "Simple, low-stakes post to start." },
      { type: "reorder", question: "Build in public steps:", items: ["Share one small thing", "Be consistent", "Share mistakes", "Share learnings"], correctOrder: [0,3,2,1], explanation: "Small first → share learnings → share mistakes → consistent." },
      { type: "fill-blank", question: "Build in public for _______, not praise.", correct: ["accountability", "learning", "connection"], explanation: "The real benefits are internal and relational." },
      { type: "reflection", question: "What's one small thing you could share this week about your hobby?", minChars: 50, explanation: "Start tiny." }
    ]
  },
  {
    id: "hob-13",
    title: "Habit Stacking for Hobbies",
    unit: 5,
    unitName: "Making It Stick",
    exercises: [
      { type: "multiple-choice", question: "Habit stacking means...", options: ["Pile lots of habits at once", "Tie your new hobby habit to an existing daily habit", "Quit old habits", "Do your hobby all day"], correct: 1, explanation: "Stack after something you already do automatically." },
      { type: "true-false", statement: "You have to do your hobby for an hour a day to make progress.", correct: false, explanation: "10 minutes a day consistently is better than 1 hour once a week." },
      { type: "scenario", question: "You want to practice guitar daily. Existing habit: drink morning coffee. How to stack?", options: ["Guitar for 1 hour anytime", "After drinking coffee, practice guitar for just 5 minutes", "Wait for perfect time", "Quit coffee"], correct: 1, explanation: "Existing cue → tiny habit." },
      { type: "reorder", question: "Stack your hobby habit:", items: ["Choose existing anchor habit", "Tie hobby after it", "Keep it tiny first"], correctOrder: [0,2,1], explanation: "Anchor first → tiny → tie after." },
      { type: "fill-blank", question: "_______ is the secret to habit formation.", correct: ["consistency", "frequency", "small steps"], explanation: "Consistency over intensity." },
      { type: "reflection", question: "What existing daily habit could you stack your hobby onto?", minChars: 50, explanation: "The best anchor is something you never skip." }
    ]
  },
  {
    id: "hob-14",
    title: "When to Quit vs. Push Through",
    unit: 5,
    unitName: "Making It Stick",
    exercises: [
      { type: "multiple-choice", question: "Good sign to quit a hobby:", options: ["It's hard", "It consistently drains you instead of energizing you", "You're not good immediately", "Someone else is better"], correct: 1, explanation: "Hobbies should recharge, not drain." },
      { type: "true-false", statement: "Quitting a hobby means you failed.", correct: false, explanation: "Quitting something that doesn't fit makes room for what does." },
      { type: "scenario", question: "You tried pottery for 3 months; it always feels stressful and you dread it. What to do?", options: ["Force yourself to keep going", "Quit pottery and try something else — it's okay!", "Spend more money on it", "Push through"], correct: 1, explanation: "Life's too short for hobbies that don't bring you joy." },
      { type: "reorder", question: "Decide quit vs push:", items: ["Notice how you feel", "Ask 'does this bring me joy?'", "Give yourself permission either way"], correctOrder: [0,1,2], explanation: "Notice → ask → permission." },
      { type: "fill-blank", question: "Quitting is just _______.", correct: ["redirection", "choosing again"], explanation: "It's not failure; it's choosing better." },
      { type: "reflection", question: "What hobby have you been pushing through that you actually don't enjoy?", minChars: 50, explanation: "Permission to quit is freeing." }
    ]
  },
  {
    id: "hob-15",
    title: "Turning Passion Into Mastery",
    unit: 5,
    unitName: "Making It Stick",
    exercises: [
      { type: "multiple-choice", question: "Mastery comes from...", options: ["Talent alone", "Consistent, deliberate practice over years", "One big break", "Luck"], correct: 1, explanation: "Mastery is a long game of small improvements." },
      { type: "true-false", statement: "Mastery means you're perfect.", correct: false, explanation: "Mastery means you're always still learning." },
      { type: "scenario", question: "You love your hobby and want to get really good at it over time. Best plan?", options: ["Expect perfection immediately", "Commit to tiny consistent practice, find a teacher/community, embrace slow growth", "Quit if not good fast", "Only practice when inspired"], correct: 1, explanation: "Long-term, sustainable plan wins." },
      { type: "reorder", question: "Path to mastery:", items: ["Long-term commitment", "Deliberate practice", "Community/feedback", "Enjoy the journey"], correctOrder: [0,1,2,3], explanation: "Commit first, practice, feedback, enjoy the ride." },
      { type: "fill-blank", question: "Mastery is a _______, not a destination.", correct: ["journey", "process"], explanation: "You never 'arrive' — you just keep growing." },
      { type: "reflection", question: "What would mastery mean to you in your hobby? What's the first step toward that?", minChars: 50, explanation: "Define what mastery looks like for you, not someone else." }
    ]
  }
];

// Export all lessons as a single object
const allLessons = {
  "mental-health": mentalHealthLessons,
  "relationships": relationshipsLessons,
  "career": careerLessons,
  "fitness": fitnessLessons,
  "finance": financeLessons,
  "hobbies": hobbiesLessons
};
