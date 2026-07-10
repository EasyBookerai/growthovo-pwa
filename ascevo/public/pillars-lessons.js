// Simplified lesson data for Pillars screen
const allLessons = {
  "mental-health": [
    { id: "mh-1", number: 1, title: "Understanding Your Anxiety", duration: "5 min", difficulty: "Beginner", content: { paragraphs: ["Anxiety is your body's natural alarm system. When you face a threat, your brain triggers a cascade of physical responses: your heart races, breathing quickens, and muscles tense."] } },
    { id: "mh-2", number: 2, title: "Box Breathing Technique", duration: "5 min", difficulty: "Beginner", content: { paragraphs: ["Box breathing is a simple technique used by Navy SEALs to calm the nervous system in minutes. Breathe in for 4, hold for 4, breathe out for 4, hold for 4."] } },
    { id: "mh-3", number: 3, title: "Cognitive Reframing 101", duration: "5 min", difficulty: "Beginner", content: { paragraphs: ["Cognitive reframing is changing how you interpret a situation without changing the facts. It's not forcing positivity—it's finding a more balanced perspective."] } },
    { id: "mh-4", number: 4, title: "Building Emotional Awareness", duration: "6 min", difficulty: "Beginner", content: { paragraphs: ["Emotional awareness is recognizing and naming what you're feeling in real-time. Most people live on autopilot, reacting without understanding."] } },
    { id: "mh-5", number: 5, title: "Managing Overwhelm", duration: "8 min", difficulty: "Intermediate", content: { paragraphs: ["Overwhelm happens when your to-do list feels infinite. Your brain perceives threat and freezes. The solution isn't doing more—it's thinking smaller."] } },
    { id: "mh-6", number: 6, title: "Sleep Hygiene Basics", duration: "5 min", difficulty: "Beginner", content: { paragraphs: ["Sleep is the foundation of mental health. Poor sleep amplifies anxiety and weakens emotional regulation. Sleep hygiene matters as much as duration."] } }
  ],
  "relationships": [
    { id: "rel-1", number: 1, title: "Active Listening Mastery", duration: "5 min", difficulty: "Beginner", content: { paragraphs: ["Active listening is giving someone your full attention without planning your response. Most people listen to reply, not to understand."] } },
    { id: "rel-2", number: 2, title: "Setting Healthy Boundaries", duration: "5 min", difficulty: "Beginner", content: { paragraphs: ["Boundaries protect your energy, time, and values. They're not walls—they're guidelines that prevent resentment."] } },
    { id: "rel-3", number: 3, title: "Conflict Resolution Skills", duration: "5 min", difficulty: "Beginner", content: { paragraphs: ["Conflict is inevitable. The goal isn't avoiding disagreements—it's navigating them without damaging the connection."] } },
    { id: "rel-4", number: 4, title: "Expressing Appreciation", duration: "5 min", difficulty: "Beginner", content: { paragraphs: ["Appreciation is oxygen for relationships. When people feel valued, connection deepens. When taken for granted, resentment builds."] } },
    { id: "rel-5", number: 5, title: "Understanding Love Languages", duration: "7 min", difficulty: "Beginner", content: { paragraphs: ["People give and receive love differently: words, time, touch, acts, gifts. Misalignment creates disconnection."] } },
    { id: "rel-6", number: 6, title: "Repairing After Arguments", duration: "6 min", difficulty: "Intermediate", content: { paragraphs: ["Every relationship has conflict. What matters is repairing afterward. Successful couples repair quickly and effectively."] } }
  ],
  "career": [
    { id: "car-1", number: 1, title: "Defining Your Career Vision", duration: "5 min", difficulty: "Beginner", content: { paragraphs: ["Most people drift through careers reacting to opportunities. A clear vision acts as your North Star for decisions."] } },
    { id: "car-2", number: 2, title: "Deep Work: Focus Without Distraction", duration: "5 min", difficulty: "Beginner", content: { paragraphs: ["Deep work is focusing without distraction on cognitively demanding tasks. One hour of deep work beats four hours of shallow work."] } },
    { id: "car-3", number: 3, title: "Personal Branding Basics", duration: "5 min", difficulty: "Beginner", content: { paragraphs: ["Your personal brand is what people say about you when you're not in the room. It's about intentionally shaping perception."] } },
    { id: "car-4", number: 4, title: "Time Management for Professionals", duration: "6 min", difficulty: "Beginner", content: { paragraphs: ["Time management isn't cramming more tasks—it's protecting time for what matters most using frameworks like Eisenhower Matrix."] } },
    { id: "car-5", number: 5, title: "Networking Without Awkwardness", duration: "7 min", difficulty: "Intermediate", content: { paragraphs: ["Networking feels transactional when you think 'What can they do for me?' Instead ask 'How can I add value?'"] } },
    { id: "car-6", number: 6, title: "Asking for Feedback", duration: "5 min", difficulty: "Beginner", content: { paragraphs: ["Feedback is the fastest path to improvement. Without it, you're guessing. With it, you get specific direction."] } }
  ],
  "fitness": [
    { id: "fit-1", number: 1, title: "Building a Sustainable Routine", duration: "5 min", difficulty: "Beginner", content: { paragraphs: ["The biggest mistake is starting too hard, too fast. A sustainable routine isn't about intensity—it's about consistency."] } },
    { id: "fit-2", number: 2, title: "The Science of Sleep & Recovery", duration: "5 min", difficulty: "Beginner", content: { paragraphs: ["Most adults need 7-9 hours. Quality matters as much as quantity. Create a sleep-friendly environment: cool, dark, quiet."] } },
    { id: "fit-3", number: 3, title: "Nutrition Essentials", duration: "5 min", difficulty: "Beginner", content: { paragraphs: ["Focus on fundamentals: eat enough protein, consume vegetables, stay hydrated. These basics beat any trendy diet."] } },
    { id: "fit-4", number: 4, title: "Bodyweight Strength Training", duration: "7 min", difficulty: "Intermediate", content: { paragraphs: ["You don't need a gym. Push-ups, squats, lunges, planks target every major muscle group effectively."] } },
    { id: "fit-5", number: 5, title: "Preventing Workout Injuries", duration: "6 min", difficulty: "Intermediate", content: { paragraphs: ["Most injuries are preventable. They happen when you push too hard, use poor form, or skip warm-ups."] } },
    { id: "fit-6", number: 6, title: "Recovery and Rest Days", duration: "5 min", difficulty: "Beginner", content: { paragraphs: ["Rest days aren't lazy—they're strategic. Muscles repair and grow during rest, not during workouts."] } }
  ],
  "finance": [
    { id: "fin-1", number: 1, title: "Track Every Euro: Budgeting 101", duration: "5 min", difficulty: "Beginner", content: { paragraphs: ["A budget isn't restriction—it's awareness and control. Most people have no idea where their money goes each month."] } },
    { id: "fin-2", number: 2, title: "Emergency Fund: Why & How", duration: "5 min", difficulty: "Beginner", content: { paragraphs: ["An emergency fund is your financial safety net for unexpected expenses. Start with €1,000, then build to 3-6 months."] } },
    { id: "fin-3", number: 3, title: "Investing Basics for Beginners", duration: "5 min", difficulty: "Beginner", content: { paragraphs: ["Investing isn't just for the wealthy—it's how you build wealth. Start with low-cost index funds and dollar-cost averaging."] } },
    { id: "fin-4", number: 4, title: "Understanding Credit Scores", duration: "8 min", difficulty: "Intermediate", content: { paragraphs: ["Your credit score determines financial opportunities: mortgage rates, loans, rentals. Above 700 is good, above 750 excellent."] } },
    { id: "fin-5", number: 5, title: "Investing for Beginners", duration: "10 min", difficulty: "Intermediate", content: { paragraphs: ["Compound returns create exponential growth. €1,000 at 8% becomes €10,000 in 30 years without adding another euro."] } },
    { id: "fin-6", number: 6, title: "Debt Payoff Strategies", duration: "7 min", difficulty: "Intermediate", content: { paragraphs: ["Choose debt avalanche (highest interest) or snowball (smallest balance). Both work if you stick with them."] } }
  ],
  "hobbies": [
    { id: "hob-1", number: 1, title: "Finding Your Creative Flow", duration: "5 min", difficulty: "Beginner", content: { paragraphs: ["Flow is when time disappears and you're completely absorbed. It happens when challenge and skill are perfectly balanced."] } },
    { id: "hob-2", number: 2, title: "Turning Passion into Practice", duration: "5 min", difficulty: "Beginner", content: { paragraphs: ["Passion without practice is daydreaming. Small regular sessions beat occasional marathon efforts every time."] } },
    { id: "hob-3", number: 3, title: "Learning Any Skill Faster", duration: "5 min", difficulty: "Beginner", content: { paragraphs: ["Learning happens through active engagement, not passive consumption. Spend 20% learning, 80% practicing."] } },
    { id: "hob-4", number: 4, title: "Overcoming Creative Blocks", duration: "6 min", difficulty: "Intermediate", content: { paragraphs: ["Creative blocks happen when your inner critic overpowers your creator. Lower the stakes by giving yourself permission to create garbage."] } },
    { id: "hob-5", number: 5, title: "Building a Practice Routine", duration: "8 min", difficulty: "Intermediate", content: { paragraphs: ["Deliberate practice—focused, structured repetition with feedback—is how mastery happens. Random practice feels good but doesn't drive improvement."] } },
    { id: "hob-6", number: 6, title: "Sharing Your Work", duration: "7 min", difficulty: "Intermediate", content: { paragraphs: ["Sharing creative work feels vulnerable. But feedback shows what works, community keeps you motivated, and accountability pushes you to finish."] } }
  ]
};
