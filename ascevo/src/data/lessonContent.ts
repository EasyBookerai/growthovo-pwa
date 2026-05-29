/**
 * Lesson Content Data
 * 
 * Educational content for all 24 lessons across 6 life pillars.
 * Each lesson contains 3-4 paragraphs (150-250 words) and a key takeaway under 20 words.
 * Content is written at a beginner-friendly reading level (Grade 8-10).
 */

export interface LessonContent {
  paragraphs: string[];
  keyTakeaway: string;
}

export interface LessonData {
  id: string;
  pillarKey: string;
  number: number;
  title: string;
  duration: string;
  difficulty: string;
  content: LessonContent;
}

/**
 * LESSON_CONTENT constant
 * 
 * Contains all lesson data for the premium pillars experience.
 * Organized by pillar key and lesson number.
 */
export const LESSON_CONTENT: Record<string, LessonData> = {
  // ============================================
  // MENTAL HEALTH PILLAR LESSONS
  // ============================================
  
  'mental-health-lesson-1': {
    id: 'mental-health-lesson-1',
    pillarKey: 'mental-health',
    number: 1,
    title: 'Understanding Your Anxiety',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'Anxiety is your body\'s natural alarm system. When you face a threat, your brain triggers a cascade of physical responses: your heart races, breathing quickens, and muscles tense. This is the fight-or-flight response, designed to protect you from danger.',
        'The problem is that modern life triggers this alarm for non-life-threatening situations. A work presentation, a difficult conversation, or even checking your phone can activate the same response your ancestors used to escape predators. Your body can\'t tell the difference between real danger and perceived stress.',
        'Common physical symptoms include racing heart, shallow breathing, sweaty palms, muscle tension, and stomach discomfort. You might also experience racing thoughts, difficulty concentrating, or a sense of impending doom. These feelings are uncomfortable but not dangerous.',
        'Understanding that anxiety is a normal biological response helps you respond with compassion instead of fear. When you recognize these symptoms as your body trying to protect you, you can begin to work with your nervous system rather than against it.'
      ],
      keyTakeaway: 'Anxiety is your body\'s alarm system—it\'s not dangerous, just uncomfortable'
    }
  },
  
  'mental-health-lesson-2': {
    id: 'mental-health-lesson-2',
    pillarKey: 'mental-health',
    number: 2,
    title: 'Box Breathing in 5 Minutes',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'Box breathing is a simple technique used by Navy SEALs, athletes, and therapists to calm the nervous system in minutes. The pattern is straightforward: breathe in for 4 counts, hold for 4, breathe out for 4, hold for 4. Repeat this cycle 5-10 times.',
        'This technique works because it activates your parasympathetic nervous system, which controls your body\'s rest-and-digest response. When you extend your exhale and add pauses, you signal to your brain that you\'re safe. Your heart rate slows, blood pressure drops, and stress hormones decrease.',
        'You can practice box breathing anywhere: before a meeting, during a stressful moment, or before bed. Sit comfortably, close your eyes if possible, and place one hand on your belly. As you breathe, feel your belly expand on the inhale and contract on the exhale.',
        'Start with just 2-3 minutes if 5 feels too long. The key is consistency, not perfection. Even one cycle can help reset your nervous system when you\'re feeling overwhelmed.'
      ],
      keyTakeaway: 'Four counts in, hold, out, hold—your portable calm button'
    }
  },
  
  'mental-health-lesson-3': {
    id: 'mental-health-lesson-3',
    pillarKey: 'mental-health',
    number: 3,
    title: 'Cognitive Reframing 101',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'Cognitive reframing is the practice of changing how you interpret a situation without changing the facts. It\'s not about forcing positive thinking or denying reality. Instead, it\'s about finding a more balanced, helpful perspective when your mind jumps to worst-case scenarios.',
        'For example, if you think "I\'m terrible at presentations," you might reframe it as "I\'m still learning to present, and I improve each time." The facts haven\'t changed—you\'re acknowledging the challenge—but the new frame opens up possibility instead of shutting you down.',
        'This differs from toxic positivity, which dismisses real problems with phrases like "just think positive!" Reframing acknowledges difficulty while looking for agency and growth. It asks: "What else could be true?" rather than "What\'s the worst that could happen?"',
        'Practice by catching one negative thought today and asking: "Is there another way to look at this?" You\'re not lying to yourself—you\'re training your brain to see options instead of dead ends.'
      ],
      keyTakeaway: 'Change the story, change the feeling—same facts, better frame'
    }
  },
  
  'mental-health-lesson-4': {
    id: 'mental-health-lesson-4',
    pillarKey: 'mental-health',
    number: 4,
    title: 'Building a Journaling Habit',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'Journaling is one of the most researched mental health practices. Studies show it reduces anxiety, improves mood, and helps process difficult emotions. The act of writing moves thoughts from your head to paper, creating distance and clarity.',
        'You don\'t need to write pages or be poetic. Start with three simple prompts: "What am I feeling right now?", "What\'s one thing that went well today?", and "What\'s one thing I\'m worried about?" Write 2-3 sentences for each. That\'s it.',
        'The best time to journal is either first thing in the morning to set intentions, or last thing at night to process the day. Pick one time and stick with it for two weeks. Keep your journal and pen in the same visible spot as a reminder.',
        'If you miss a day, don\'t quit. Just start again the next day. The goal isn\'t perfection—it\'s creating a space to check in with yourself regularly.'
      ],
      keyTakeaway: 'Five minutes, three sentences, one habit—that\'s all you need'
    }
  },

  // ============================================
  // RELATIONSHIPS PILLAR LESSONS
  // ============================================
  
  'relationships-lesson-1': {
    id: 'relationships-lesson-1',
    pillarKey: 'relationships',
    number: 1,
    title: 'Active Listening Mastery',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'Active listening is the foundation of meaningful connection. It means giving someone your full attention without planning your response, judging, or interrupting. Most people listen to reply, not to understand. This creates conversations where both people are waiting for their turn to talk rather than truly hearing each other.',
        'The practice has three core elements: focus your attention entirely on the speaker, reflect back what you hear to confirm understanding, and ask open-ended questions to go deeper. Put your phone away, make eye contact, and notice their body language and tone, not just their words.',
        'Try this simple technique: after someone finishes speaking, pause for two seconds before responding. Then say, "What I\'m hearing is..." and summarize their main point. Ask, "Did I get that right?" This small shift shows you\'re genuinely listening and gives them space to clarify.',
        'Active listening builds trust faster than any other communication skill. When people feel heard, they open up. When they open up, real connection becomes possible.'
      ],
      keyTakeaway: 'Listen to understand, not to reply—connection starts with attention'
    }
  },
  
  'relationships-lesson-2': {
    id: 'relationships-lesson-2',
    pillarKey: 'relationships',
    number: 2,
    title: 'Setting Healthy Boundaries',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'Boundaries are not walls—they\'re guidelines that protect your energy, time, and values. Many people avoid setting boundaries because they fear conflict or being seen as selfish. But boundaries actually strengthen relationships by creating clarity and preventing resentment.',
        'A healthy boundary sounds like: "I can\'t take on extra work this week, but I can help next Monday," or "I need 30 minutes to decompress after work before we talk about the day." Notice these statements are clear, specific, and offer an alternative when possible.',
        'The key is communicating boundaries calmly and early, before frustration builds. Use "I" statements to express your needs without blaming: "I feel overwhelmed when plans change last minute. I need advance notice when possible." This focuses on your experience, not their behavior.',
        'Expect some pushback at first, especially from people used to you saying yes to everything. Hold firm with kindness. Boundaries teach people how to treat you, and the right people will respect them.'
      ],
      keyTakeaway: 'Boundaries protect relationships by preventing resentment before it starts'
    }
  },
  
  'relationships-lesson-3': {
    id: 'relationships-lesson-3',
    pillarKey: 'relationships',
    number: 3,
    title: 'Conflict Resolution Skills',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'Conflict is inevitable in any close relationship. The goal isn\'t to avoid disagreements—it\'s to navigate them without damaging the connection. Healthy conflict resolution focuses on solving the problem together rather than winning the argument.',
        'Start by addressing issues when you\'re calm, not in the heat of emotion. Use the formula: "When [specific behavior], I feel [emotion] because [impact]. I need [request]." For example: "When you check your phone during dinner, I feel unimportant because it seems like you\'re not interested. I need us to have phone-free meals."',
        'Avoid the "Four Horsemen" of relationship conflict: criticism (attacking character), contempt (disrespect), defensiveness (playing the victim), and stonewalling (shutting down). These patterns predict relationship failure. Instead, focus on the specific issue, take responsibility for your part, and stay engaged even when it\'s uncomfortable.',
        'Remember, you\'re on the same team. The problem is the enemy, not the person. Ask yourself: "Do I want to be right, or do I want to be connected?"'
      ],
      keyTakeaway: 'Solve problems together, not against each other—you\'re on the same team'
    }
  },
  
  'relationships-lesson-4': {
    id: 'relationships-lesson-4',
    pillarKey: 'relationships',
    number: 4,
    title: 'Deepening Emotional Intimacy',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'Emotional intimacy is the feeling of being truly known and accepted by another person. It\'s built through vulnerability—sharing your inner world and creating space for others to share theirs. Many relationships stay surface-level because both people are afraid to go deeper.',
        'Start small by sharing something you don\'t usually talk about: a fear, a dream, a childhood memory, or something you\'re struggling with. Vulnerability is contagious. When you open up authentically, you give others permission to do the same.',
        'Ask deeper questions beyond "How was your day?" Try: "What\'s been on your mind lately?" or "What\'s something you\'re proud of this week?" or "What\'s one thing you wish people understood about you?" Then listen without trying to fix or advise—just be present.',
        'Emotional intimacy requires consistency. Set aside 15 minutes a week for intentional connection time with important people in your life. No phones, no distractions—just honest conversation. This practice transforms relationships over time.'
      ],
      keyTakeaway: 'Vulnerability builds intimacy—share your inner world to deepen connection'
    }
  },

  // ============================================
  // CAREER PILLAR LESSONS
  // ============================================
  
  'career-lesson-1': {
    id: 'career-lesson-1',
    pillarKey: 'career',
    number: 1,
    title: 'Defining Your Career Vision',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'Most people drift through their careers reacting to opportunities rather than creating them. A clear career vision acts as your North Star—it helps you make decisions, prioritize opportunities, and stay motivated when challenges arise. Without it, you\'re navigating without a map.',
        'Start by asking yourself three questions: What kind of work energizes me? What impact do I want to have? What does success look like in 5 years? Don\'t worry about being realistic yet—focus on what genuinely excites you. Your vision should pull you forward, not feel like an obligation.',
        'Write down your answers in specific terms. Instead of "I want to be successful," try "I want to lead a team of 10 people building products that help small businesses grow." Specificity creates clarity, and clarity drives action.',
        'Review your vision quarterly and adjust as you learn and grow. Your career vision isn\'t a rigid plan—it\'s a living document that evolves with you. The goal is direction, not perfection.'
      ],
      keyTakeaway: 'A clear vision turns career drift into intentional growth'
    }
  },
  
  'career-lesson-2': {
    id: 'career-lesson-2',
    pillarKey: 'career',
    number: 2,
    title: 'Deep Work: Focus Without Distraction',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'Deep work is the ability to focus without distraction on cognitively demanding tasks. In a world of constant notifications and meetings, this skill has become rare—and therefore extremely valuable. One hour of deep work produces more meaningful output than four hours of shallow, distracted work.',
        'The key is creating the right environment. Block 90-minute sessions on your calendar and treat them as unmovable appointments. Turn off notifications, close unnecessary tabs, and put your phone in another room. Tell colleagues you\'re unavailable during this time.',
        'Start your deep work session by defining one specific outcome: "Write the first draft of the proposal" or "Solve the database performance issue." This clarity prevents you from drifting into easier, less important tasks when focus gets difficult.',
        'Build up gradually. If 90 minutes feels impossible, start with 25-minute sessions using the Pomodoro Technique. The goal is training your attention like a muscle—it gets stronger with consistent practice.'
      ],
      keyTakeaway: 'Focused work beats busy work—protect your attention like your career depends on it'
    }
  },
  
  'career-lesson-3': {
    id: 'career-lesson-3',
    pillarKey: 'career',
    number: 3,
    title: 'Personal Branding Basics',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'Your personal brand is what people say about you when you\'re not in the room. It\'s not about self-promotion or being fake—it\'s about intentionally shaping how your skills, values, and expertise are perceived. In today\'s connected world, your reputation is your most valuable career asset.',
        'Start by identifying your unique combination of skills and perspective. What do you do well that others find valuable? What problems do you solve? What do colleagues come to you for? Your brand should reflect your authentic strengths, not who you think you should be.',
        'Make your expertise visible through consistent sharing. Write LinkedIn posts about lessons you\'ve learned, contribute to team discussions, or share insights in industry communities. You don\'t need to be an expert—you just need to share what you\'re learning along the way.',
        'Remember, personal branding is a long game. One post won\'t change your career, but consistent visibility over months and years compounds. Show up regularly, add value generously, and your reputation will grow organically.'
      ],
      keyTakeaway: 'Your reputation is built daily through consistent visibility and value'
    }
  },
  
  'career-lesson-4': {
    id: 'career-lesson-4',
    pillarKey: 'career',
    number: 4,
    title: 'Negotiation Fundamentals',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'Negotiation isn\'t about being aggressive or manipulative—it\'s about advocating for your value while finding solutions that work for everyone. Most people avoid negotiating because they fear conflict or rejection. But every time you don\'t negotiate, you leave money and opportunities on the table.',
        'Preparation is everything. Before any negotiation, research market rates for your role and experience level. Know your target number, your minimum acceptable offer, and your walk-away point. When you have data and clear boundaries, you negotiate from confidence, not desperation.',
        'Use this simple framework: anchor high with your target number, explain your value with specific examples, then pause and let them respond. Silence is powerful—resist the urge to fill it. Most people negotiate against themselves by talking too much.',
        'Remember, negotiation isn\'t just about salary. You can negotiate remote work, flexible hours, professional development budget, title, start date, or equity. Think creatively about what matters to you beyond base pay.'
      ],
      keyTakeaway: 'Negotiate every offer—your future self will thank you for it'
    }
  },

  // ============================================
  // FITNESS PILLAR LESSONS
  // ============================================
  
  'fitness-lesson-1': {
    id: 'fitness-lesson-1',
    pillarKey: 'fitness',
    number: 1,
    title: 'Building a Sustainable Routine',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'The biggest mistake people make with fitness is starting too hard, too fast. They commit to working out six days a week, burn out in two weeks, and quit. A sustainable routine isn\'t about intensity—it\'s about consistency. Three workouts a week that you actually do beats seven workouts a week that you don\'t.',
        'Start by choosing activities you genuinely enjoy. If you hate running, don\'t force yourself to run. Try walking, swimming, dancing, cycling, or strength training. The best exercise is the one you\'ll actually show up for. Enjoyment is the secret ingredient to long-term consistency.',
        'Schedule your workouts like appointments. Pick specific days and times, and protect that time. Morning workouts work well because they\'re done before life gets in the way. But if evenings work better for your schedule, that\'s fine too. The key is consistency, not timing.',
        'Start small and build gradually. If you\'re new to exercise, begin with 20-minute sessions three times a week. Once that feels easy, add five minutes or an extra day. Slow, steady progress beats dramatic transformations that don\'t last.'
      ],
      keyTakeaway: 'Consistency beats intensity—show up regularly, not perfectly'
    }
  },
  
  'fitness-lesson-2': {
    id: 'fitness-lesson-2',
    pillarKey: 'fitness',
    number: 2,
    title: 'The Science of Sleep & Recovery',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'Sleep is when your body repairs muscle tissue, consolidates learning, and regulates hormones. Without adequate sleep, your workouts become less effective, your appetite increases, and your motivation drops. You can\'t out-train poor sleep—recovery is when the magic happens.',
        'Most adults need 7-9 hours of sleep per night. Quality matters as much as quantity. Create a sleep-friendly environment: keep your room cool (65-68°F), dark, and quiet. Avoid screens for an hour before bed—the blue light disrupts melatonin production and delays sleep onset.',
        'Establish a consistent sleep schedule by going to bed and waking up at the same time every day, even on weekends. Your body thrives on routine. If you struggle to fall asleep, try a wind-down ritual: dim the lights, read a book, or practice gentle stretching.',
        'Recovery isn\'t just about sleep. Rest days are essential for muscle repair and preventing burnout. On rest days, you can do light activity like walking or stretching, but avoid intense workouts. Your body gets stronger during rest, not during the workout itself.'
      ],
      keyTakeaway: 'Muscles grow during rest, not during workouts—prioritize recovery'
    }
  },
  
  'fitness-lesson-3': {
    id: 'fitness-lesson-3',
    pillarKey: 'fitness',
    number: 3,
    title: 'Nutrition Essentials',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'Nutrition doesn\'t have to be complicated. Focus on three fundamentals: eat enough protein to support muscle repair, consume plenty of vegetables for vitamins and fiber, and stay hydrated throughout the day. These basics will take you further than any trendy diet.',
        'Protein is essential for building and maintaining muscle. Aim for 0.7-1 gram of protein per pound of body weight daily. Good sources include chicken, fish, eggs, Greek yogurt, beans, and tofu. Spread protein intake across meals rather than loading it all at dinner.',
        'Vegetables provide micronutrients that support energy, recovery, and overall health. Aim for at least three servings per day, focusing on variety and color. Dark leafy greens, colorful peppers, and cruciferous vegetables like broccoli are nutrient powerhouses.',
        'Hydration affects everything from energy levels to workout performance. Drink water consistently throughout the day—don\'t wait until you\'re thirsty. A simple rule: drink half your body weight in ounces daily. If you exercise, add 16-20 ounces for every hour of activity.'
      ],
      keyTakeaway: 'Protein, vegetables, water—master the basics before chasing trends'
    }
  },
  
  'fitness-lesson-4': {
    id: 'fitness-lesson-4',
    pillarKey: 'fitness',
    number: 4,
    title: 'Progressive Overload Explained',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'Progressive overload is the principle of gradually increasing the demands on your body to drive continuous improvement. If you do the same workout with the same weight every week, your body adapts and stops changing. To get stronger, you need to progressively challenge yourself.',
        'There are several ways to apply progressive overload: increase the weight you lift, add more repetitions, perform more sets, reduce rest time between sets, or improve your form and range of motion. You don\'t need to do all of these at once—pick one variable to progress each week.',
        'Start conservatively. If you\'re lifting weights, increase by 5-10 pounds when you can complete all sets with good form. If you\'re doing bodyweight exercises, add one or two reps per set each week. Small, consistent increases compound into significant strength gains over months.',
        'Track your workouts in a simple notebook or app. Write down exercises, sets, reps, and weight used. This data shows you exactly when to progress and prevents you from guessing. What gets measured gets improved.'
      ],
      keyTakeaway: 'Small, consistent increases compound into major strength gains over time'
    }
  },

  // ============================================
  // FINANCE PILLAR LESSONS
  // ============================================
  
  'finance-lesson-1': {
    id: 'finance-lesson-1',
    pillarKey: 'finance',
    number: 1,
    title: 'Track Every Euro: Budgeting 101',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'A budget isn\'t about restriction—it\'s about awareness and control. Most people have no idea where their money goes each month. They earn, they spend, and somehow there\'s nothing left. Tracking every euro for just one month reveals patterns you never noticed: the daily coffee that costs €100 monthly, the subscriptions you forgot about, the impulse purchases that add up.',
        'Start with the 50/30/20 rule as a framework: 50% of your income for needs (rent, groceries, utilities), 30% for wants (dining out, entertainment, hobbies), and 20% for savings and debt repayment. This isn\'t rigid—it\'s a starting point. Adjust based on your situation, but the key is intentionality.',
        'Use a simple tracking method that you\'ll actually stick with. A notes app, a spreadsheet, or a budgeting app—whatever feels easiest. At the end of each day, log your spending in categories. After one month, review the data. You\'ll spot leaks immediately: areas where you\'re spending more than you thought or on things that don\'t align with your values.',
        'The goal isn\'t perfection. You\'ll overspend some months. That\'s normal. The goal is visibility. When you know where your money goes, you can make conscious choices instead of wondering why you\'re always broke.'
      ],
      keyTakeaway: 'Awareness precedes control—track spending to take back financial power'
    }
  },
  
  'finance-lesson-2': {
    id: 'finance-lesson-2',
    pillarKey: 'finance',
    number: 2,
    title: 'Emergency Fund: Why & How',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'An emergency fund is your financial safety net. It\'s cash set aside for unexpected expenses: car repairs, medical bills, job loss, or urgent home repairs. Without it, one surprise expense can spiral into debt. With it, you handle emergencies without panic or high-interest loans.',
        'Start with a goal of €1,000 as your first milestone. This covers most small emergencies and gives you breathing room. Once you hit €1,000, aim for 3-6 months of essential expenses. Calculate your monthly rent, groceries, utilities, insurance, and minimum debt payments. Multiply by three. That\'s your target.',
        'Build it gradually by automating small transfers. Set up a recurring transfer of €50-100 per paycheck into a separate savings account. Make it automatic so you don\'t have to think about it. Treat it like a bill you pay to your future self. Even €25 per week becomes €1,300 in a year.',
        'Keep your emergency fund in a high-yield savings account—accessible but separate from your checking account. You want it available when needed, but not so easy to access that you dip into it for non-emergencies. This fund isn\'t for vacations or new gadgets. It\'s for true emergencies only.'
      ],
      keyTakeaway: 'Three to six months of expenses—your buffer against financial chaos'
    }
  },
  
  'finance-lesson-3': {
    id: 'finance-lesson-3',
    pillarKey: 'finance',
    number: 3,
    title: 'Investing Basics for Beginners',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'Investing isn\'t just for the wealthy—it\'s how you build wealth. When you save money in a regular bank account, inflation slowly erodes its value. When you invest, your money works for you, growing through compound returns over time. The earlier you start, the more time your money has to grow exponentially.',
        'Start with low-cost index funds, which spread your investment across hundreds of companies automatically. Instead of picking individual stocks (risky and time-consuming), index funds give you instant diversification. A total market index fund owns a piece of the entire stock market. When the market grows, you grow with it.',
        'The key principle is time in the market, not timing the market. Don\'t wait for the "perfect moment" to invest. Start small—even €50 per month—and invest consistently regardless of market ups and downs. This strategy, called dollar-cost averaging, reduces risk by spreading purchases over time.',
        'Think long-term. Investing is not a get-rich-quick scheme. Expect volatility—markets go up and down. But historically, over 10-20 years, diversified investments have consistently grown. Don\'t panic and sell when markets drop. Stay the course, keep investing, and let compound growth do its work.'
      ],
      keyTakeaway: 'Start small, invest consistently, think decades—compound growth builds wealth'
    }
  },
  
  'finance-lesson-4': {
    id: 'finance-lesson-4',
    pillarKey: 'finance',
    number: 4,
    title: 'Eliminating Bad Debt Fast',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'Not all debt is equal. "Good debt" like a mortgage or student loan can build assets or increase earning potential. "Bad debt" like high-interest credit cards or payday loans drains your wealth through interest. If you\'re paying 18-25% interest on credit card balances, that debt is actively working against your financial future.',
        'Use the debt avalanche method to eliminate bad debt efficiently. List all debts with their interest rates. Make minimum payments on everything, then throw every extra euro at the debt with the highest interest rate. Once that\'s gone, move to the next highest. This method saves you the most money in interest over time.',
        'Alternatively, use the debt snowball method for psychological wins. List debts from smallest to largest balance. Pay minimums on everything, then attack the smallest debt first. When it\'s gone, roll that payment into the next smallest. The quick wins build momentum and motivation, even if you pay slightly more interest overall.',
        'Stop adding new debt while paying off old debt. Cut up credit cards if needed, or freeze them in a block of ice—literally. Use cash or debit for purchases. Every euro you don\'t spend on interest is a euro that can go toward savings, investing, or things you actually value.'
      ],
      keyTakeaway: 'High-interest debt is an emergency—attack it with focus and intensity'
    }
  },

  // ============================================
  // HOBBIES PILLAR LESSONS
  // ============================================
  
  'hobbies-lesson-1': {
    id: 'hobbies-lesson-1',
    pillarKey: 'hobbies',
    number: 1,
    title: 'Finding Your Creative Flow',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'Flow is that magical state where time disappears and you\'re completely absorbed in what you\'re doing. Psychologist Mihaly Csikszentmihalyi discovered that flow happens when challenge and skill are perfectly balanced. Too easy and you\'re bored. Too hard and you\'re anxious. Just right and you enter flow.',
        'Creative hobbies are flow factories. Whether you\'re painting, playing music, writing, cooking, or building something with your hands, these activities demand just enough focus to quiet your inner critic while engaging your curiosity. The key is choosing activities that genuinely interest you, not what looks impressive to others.',
        'Start by experimenting with different creative outlets. Try three different hobbies for one month each. Notice which ones make you lose track of time. Which ones leave you energized rather than drained? Which ones do you think about when you\'re doing something else? These signals point toward your natural flow activities.',
        'Flow requires uninterrupted time. Block 60-90 minutes where you can work without distractions. Turn off notifications, close unnecessary tabs, and give yourself permission to be a beginner. Flow doesn\'t happen in 15-minute fragments—it needs space to develop.'
      ],
      keyTakeaway: 'Flow happens when challenge meets skill—find activities that absorb you completely'
    }
  },
  
  'hobbies-lesson-2': {
    id: 'hobbies-lesson-2',
    pillarKey: 'hobbies',
    number: 2,
    title: 'Turning Passion into Practice',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'Passion without practice is just daydreaming. You might love the idea of playing guitar, but if you never pick it up, it stays a fantasy. The gap between wanting to do something and actually doing it is bridged by consistent practice. Small, regular sessions beat occasional marathon efforts every time.',
        'Start with a ridiculously small commitment: 10 minutes, three times per week. This feels achievable, which means you\'ll actually do it. Once the habit is established, you can increase duration or frequency. But in the beginning, consistency matters more than intensity. Showing up is the skill you\'re building.',
        'Schedule your practice sessions like appointments. Put them on your calendar with reminders. Treat them as non-negotiable time for yourself. Morning sessions work well because they happen before life gets busy, but any consistent time works. The key is making it automatic, not something you decide daily.',
        'Track your practice to stay motivated. Use a simple habit tracker or journal. Mark an X for each completed session. After a few weeks, you\'ll see a chain of X\'s that you won\'t want to break. This visual progress creates momentum and reinforces the identity: "I\'m someone who practices regularly."'
      ],
      keyTakeaway: 'Consistent practice beats occasional passion—show up small, show up often'
    }
  },
  
  'hobbies-lesson-3': {
    id: 'hobbies-lesson-3',
    pillarKey: 'hobbies',
    number: 3,
    title: 'Learning Any Skill Faster',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'Most people approach learning inefficiently. They consume content passively—watching tutorials, reading books, taking courses—without actually practicing. But learning happens through active engagement, not passive consumption. The 80/20 rule applies: spend 20% of your time learning and 80% practicing what you learned.',
        'Break skills into smaller sub-skills and master them individually. Want to learn photography? Don\'t try to learn everything at once. Start with composition for two weeks, then move to lighting, then editing. This focused approach builds competence faster than trying to learn everything simultaneously.',
        'Use deliberate practice: identify your weakest area, focus exclusively on improving it, get immediate feedback, and repeat. If you\'re learning to cook, don\'t just follow recipes mindlessly. Focus on knife skills one week, heat control the next, seasoning after that. Target your practice toward specific improvement.',
        'Embrace the beginner phase. Everyone starts terrible at new skills. The difference between people who get good and people who quit is tolerance for being bad at first. Give yourself permission to create ugly art, play wrong notes, or write terrible first drafts. Sucking at something is the first step toward being good at it.'
      ],
      keyTakeaway: 'Practice beats theory—spend 80% doing, 20% learning'
    }
  },
  
  'hobbies-lesson-4': {
    id: 'hobbies-lesson-4',
    pillarKey: 'hobbies',
    number: 4,
    title: 'Building a Creative Habit',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'Creativity isn\'t a lightning bolt that strikes randomly—it\'s a muscle you strengthen through regular use. Professional creatives don\'t wait for inspiration. They show up consistently and create whether they feel inspired or not. The habit of creating generates more ideas than waiting for the perfect moment ever will.',
        'Build your creative habit by linking it to an existing routine. This is called habit stacking. After your morning coffee, write for 10 minutes. After dinner, sketch for 15 minutes. After your workout, practice your instrument. The existing habit acts as a trigger for the new one, making it easier to remember and execute.',
        'Create a dedicated space for your hobby, even if it\'s just a corner of a room. When you sit in that space, your brain knows it\'s time to create. This environmental cue reduces friction and makes starting easier. Keep your tools visible and accessible—guitar on a stand, sketchbook on the desk, camera by the door.',
        'Lower the barrier to starting. The hardest part of any creative session is beginning. Make it as easy as possible: pre-mix your paints, keep your journal open to a blank page, leave your instrument tuned and ready. When starting requires minimal effort, you\'re more likely to actually start.'
      ],
      keyTakeaway: 'Creativity is a habit, not a gift—show up regularly and inspiration follows'
    }
  },
};
