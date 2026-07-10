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
    title: 'Building Emotional Awareness',
    duration: '6 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'Emotional awareness is the ability to recognize and name what you\'re feeling in real-time. Most people live on emotional autopilot, reacting to feelings without understanding them. Building awareness creates space between stimulus and response, giving you choice instead of reactivity.',
        'Start by learning the emotion wheel. Beyond "good" and "bad," there are dozens of specific emotions: frustrated, disappointed, overwhelmed, anxious, content, proud, grateful. The more precisely you can name an emotion, the better you can understand and address it.',
        'Practice the STOP technique throughout your day: Stop what you\'re doing, Take a breath, Observe your emotions and body sensations, Proceed with awareness. This 30-second check-in builds the habit of tuning into your internal state instead of ignoring it until you explode.',
        'Keep a simple emotion log for one week. Three times per day, write down one emotion you\'re feeling and what triggered it. Patterns will emerge—certain situations consistently trigger specific emotions. This data shows you where to focus your emotional regulation efforts.'
      ],
      keyTakeaway: 'Name it to tame it—recognizing emotions reduces their control over you'
    }
  },
  
  'mental-health-lesson-5': {
    id: 'mental-health-lesson-5',
    pillarKey: 'mental-health',
    number: 5,
    title: 'Managing Overwhelm',
    duration: '8 min',
    difficulty: 'Intermediate',
    content: {
      paragraphs: [
        'Overwhelm happens when your to-do list feels infinite and your capacity feels finite. Your brain perceives threat, triggering stress responses that make clear thinking impossible. You freeze, procrastinate, or frantically switch between tasks without completing anything. The solution isn\'t doing more—it\'s thinking smaller.',
        'Use the brain dump technique: write every task, worry, and thought bouncing around your head onto paper. Don\'t organize or prioritize yet—just get it all out. This externalization reduces mental load immediately. Your brain can stop using energy to remember everything and start using energy to think clearly.',
        'Now categorize: what must happen today? What can wait until next week? What can you delegate or delete entirely? Most overwhelm comes from treating everything as urgent. In reality, 2-3 things truly matter today. Focus there. The rest is noise.',
        'Break overwhelming tasks into 10-minute chunks. "Finish the project" feels impossible. "Draft the first paragraph" feels doable. When you complete a small chunk, your brain gets a dopamine hit, making the next chunk easier to start. Progress creates momentum, which reduces overwhelm.'
      ],
      keyTakeaway: 'Break big into small—overwhelm shrinks when tasks become manageable'
    }
  },
  
  'mental-health-lesson-6': {
    id: 'mental-health-lesson-6',
    pillarKey: 'mental-health',
    number: 6,
    title: 'Sleep Hygiene Basics',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'Sleep is the foundation of mental health. Poor sleep amplifies anxiety, weakens emotional regulation, and makes everything harder. Yet most people treat sleep like it\'s optional, scrolling phones until midnight and wondering why they wake up exhausted. Sleep hygiene—the habits surrounding sleep—matters as much as sleep duration.',
        'Create a consistent sleep schedule. Go to bed and wake up at the same time every day, including weekends. Your body craves rhythm. After two weeks of consistency, you\'ll naturally feel tired at bedtime and alert at wake time. This circadian alignment makes sleep effortless.',
        'Build a 30-minute wind-down routine. Dim lights an hour before bed—bright lights suppress melatonin production. Put phones in another room or use night mode. Try reading, gentle stretching, or journaling. Signal to your brain that it\'s time to shift from doing mode to rest mode.',
        'Optimize your sleep environment: keep your room cool (65-68°F), dark (blackout curtains or eye mask), and quiet (white noise if needed). Reserve your bed for sleep only—no work, no scrolling. Your brain should associate bed with sleep, not with stress or stimulation.'
      ],
      keyTakeaway: 'Consistent schedule, dark room, cool temperature—sleep hygiene unlocks better rest'
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
    title: 'Expressing Appreciation',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'Appreciation is oxygen for relationships. When people feel valued, connection deepens. When they feel taken for granted, resentment builds. Yet most people drastically under-communicate appreciation, assuming others "just know" they\'re valued. They don\'t. Say it out loud.',
        'Specific appreciation matters more than generic compliments. Instead of "You\'re great," try "I noticed you stayed up late to help me finish that project. That meant a lot to me." Specificity shows you\'re paying attention and creates emotional resonance.',
        'Make appreciation a daily habit. Each evening, identify one person and one specific thing they did that you\'re grateful for. Text them, call them, or tell them in person. This practice rewires your brain to notice the good in people instead of focusing on what\'s wrong.',
        'Don\'t wait for big moments. Appreciate the small things: a thoughtful text, a home-cooked meal, showing up on time. When you consistently acknowledge small kindnesses, people feel seen and valued, strengthening your bond over time.'
      ],
      keyTakeaway: 'Specific appreciation builds connection—tell people exactly what you value'
    }
  },
  
  'relationships-lesson-5': {
    id: 'relationships-lesson-5',
    pillarKey: 'relationships',
    number: 5,
    title: 'Understanding Love Languages',
    duration: '7 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'People give and receive love in different ways. Gary Chapman identified five love languages: words of affirmation, quality time, physical touch, acts of service, and gifts. You might feel most loved through quality time, while your partner feels most loved through words of affirmation. Misalignment creates disconnection—you\'re both trying, but speaking different languages.',
        'Identify your primary love language by noticing what you request most from others and what absence causes you pain. Do you complain when someone doesn\'t spend time with you? Quality time is likely your language. Do you feel unloved without physical affection? Touch is your language.',
        'Discover others\' love languages by observing how they express love. People tend to give love in the way they want to receive it. If your friend always gives thoughtful gifts, gifts likely matter to them. If they frequently offer help, acts of service speak loudest.',
        'Once you know someone\'s language, speak it intentionally even if it\'s not your native tongue. If your partner\'s language is words of affirmation and yours is acts of service, practice verbal appreciation even though you\'d rather show love through actions. Love is about what they need, not just what comes naturally to you.'
      ],
      keyTakeaway: 'Speak their love language, not just your own—connection requires translation'
    }
  },
  
  'relationships-lesson-6': {
    id: 'relationships-lesson-6',
    pillarKey: 'relationships',
    number: 6,
    title: 'Repairing After Arguments',
    duration: '6 min',
    difficulty: 'Intermediate',
    content: {
      paragraphs: [
        'Every relationship has conflict. What matters isn\'t avoiding arguments—it\'s repairing afterward. John Gottman\'s research shows that successful couples aren\'t those who never fight; they\'re those who repair quickly and effectively. Without repair, resentment accumulates until the relationship breaks.',
        'Initiate repair as soon as you\'re calm enough to think clearly, ideally within 24 hours. Waiting too long lets wounds fester. Start with a repair attempt: "I\'m sorry for how I spoke to you earlier. Can we talk?" Even if you still disagree on the issue, acknowledging impact matters.',
        'Use the repair formula: acknowledge your part, express what you actually need, and ask about their experience. "I got defensive when you brought up the budget. I felt attacked, but I realize I shut down instead of listening. I need us to talk about money without blame. How did that conversation feel from your side?"',
        'Accept repair attempts from others gracefully. When someone extends an olive branch, don\'t keep punishing them. Say "thank you for apologizing" and engage genuinely. Refusing repair attempts trains people not to try, which slowly kills intimacy.'
      ],
      keyTakeaway: 'Repair quickly after conflict—apologize, listen, reconnect within 24 hours'
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
    title: 'Time Management for Professionals',
    duration: '6 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'Time management isn\'t about cramming more tasks into your day—it\'s about protecting time for what matters most. The Eisenhower Matrix helps you categorize tasks: urgent and important (do now), important but not urgent (schedule), urgent but not important (delegate), neither (delete).',
        'Start each week by identifying your 3 Most Important Tasks (MITs). These are high-impact activities that move your career forward: finishing a critical project, having a difficult conversation, or developing a new skill. Schedule these first, during your peak energy hours, before meetings fill your calendar.',
        'Use time blocking to protect deep work. Instead of keeping your calendar open for anyone to book meetings, block 2-hour chunks for focused work. Treat these blocks as unmovable appointments. When someone requests a meeting during that time, offer alternative slots.',
        'Say no to meetings that don\'t require your input. Before accepting, ask: "What value will I add?" and "Could this be an email?" Your calendar reflects your priorities. If it\'s filled with other people\'s agendas, you\'re not managing your time—you\'re letting others manage it for you.'
      ],
      keyTakeaway: 'Block time for what matters most—your calendar is your priority list'
    }
  },
  
  'career-lesson-5': {
    id: 'career-lesson-5',
    pillarKey: 'career',
    number: 5,
    title: 'Networking Without Awkwardness',
    duration: '7 min',
    difficulty: 'Intermediate',
    content: {
      paragraphs: [
        'Networking feels transactional and awkward because most people approach it wrong. They think "What can this person do for me?" instead of "How can I add value?" Authentic networking is about building genuine relationships, not collecting business cards or LinkedIn connections.',
        'Start by showing up in communities where your ideal connections already gather: industry conferences, online communities, local meetups, or professional associations. Don\'t pitch yourself immediately. Listen, contribute valuable insights, ask thoughtful questions. Be helpful without expecting immediate returns.',
        'Follow the give-first principle. When you meet someone interesting, think: "What can I offer them?" Share a useful article, make an introduction, offer feedback on their work. Generosity without expectation creates goodwill. When you need help later, people remember who added value.',
        'Master the warm follow-up. After meeting someone, send a personalized message within 48 hours. Reference something specific from your conversation and suggest a low-pressure next step: "Enjoyed talking about remote work policies. I\'d love to hear more about how your company implemented it—coffee next week?" Keep it simple and genuine.'
      ],
      keyTakeaway: 'Give first, expect nothing—authentic networking builds real relationships'
    }
  },
  
  'career-lesson-6': {
    id: 'career-lesson-6',
    pillarKey: 'career',
    number: 6,
    title: 'Asking for Feedback',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'Most people avoid feedback because they fear criticism. But feedback is the fastest path to improvement. Without it, you\'re guessing what to improve. With it, you get specific direction. The key is asking the right questions to the right people at the right time.',
        'Ask specific questions instead of "How am I doing?" Try: "What\'s one thing I could do to make my presentations more engaging?" or "Where do you see the biggest gap in my technical skills?" Specific questions get actionable answers. Vague questions get vague platitudes.',
        'Choose the right people: those who have the expertise you want, who have seen your work directly, and who care about your growth. Don\'t ask your best friend for career advice if they\'ve never worked in your field. Seek feedback from people whose opinion actually matters.',
        'Receive feedback gracefully. Listen without defending or explaining. Say "Thank you, I hadn\'t considered that" even if you disagree. You don\'t have to act on every piece of feedback, but you must listen respectfully. People stop giving honest feedback when you argue with it.'
      ],
      keyTakeaway: 'Ask specific questions, listen without defending—feedback accelerates growth'
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
    title: 'Bodyweight Strength Training',
    duration: '7 min',
    difficulty: 'Intermediate',
    content: {
      paragraphs: [
        'You don\'t need a gym to build strength. Bodyweight training uses your own weight as resistance, making it accessible anywhere. Push-ups, squats, lunges, planks, and pull-ups (or assisted variations) target every major muscle group effectively.',
        'Start with fundamental movement patterns: push (push-ups, dips), pull (rows, pull-ups), squat (bodyweight squats, lunges), hinge (glute bridges, single-leg deadlifts), and core (planks, dead bugs). Master these basics with proper form before adding complexity.',
        'Progression doesn\'t require equipment. Make exercises harder by changing leverage, tempo, or range of motion. Can\'t do a full push-up? Start on your knees. Too easy? Elevate your feet or slow down the descent to 3 seconds. Push-ups too easy? Try archer push-ups or one-arm variations.',
        'Build a simple 3-day routine: Day 1 (Push focus): push-ups, pike push-ups, tricep dips, planks. Day 2 (Pull focus): inverted rows, pull-up progressions, bicep curls with resistance bands. Day 3 (Legs focus): squats, lunges, single-leg deadlifts, calf raises. Do 3 sets of 8-12 reps per exercise.'
      ],
      keyTakeaway: 'Your body is the gym—master bodyweight basics before adding equipment'
    }
  },
  
  'fitness-lesson-5': {
    id: 'fitness-lesson-5',
    pillarKey: 'fitness',
    number: 5,
    title: 'Preventing Workout Injuries',
    duration: '6 min',
    difficulty: 'Intermediate',
    content: {
      paragraphs: [
        'Most workout injuries are preventable. They happen when you push too hard too fast, use poor form, or skip warm-ups. Smart training prioritizes longevity over intensity. You can\'t build strength if you\'re constantly injured and unable to train.',
        'Always warm up for 5-10 minutes before training. Start with light cardio (jumping jacks, jogging in place) to increase blood flow, then do dynamic stretches that mimic your workout movements. If you\'re squatting, do bodyweight squats. If you\'re doing upper body, do arm circles and light push-ups.',
        'Form beats weight every time. Using proper technique with lighter weight is safer and more effective than lifting heavy with poor form. If you can\'t complete a rep with full range of motion and control, the weight is too heavy. Drop the ego, reduce the weight, and master the movement pattern first.',
        'Listen to your body. Muscle soreness is normal. Sharp pain, joint discomfort, or pain that worsens during exercise is a red flag—stop immediately. Pushing through injury-type pain turns minor issues into major problems that sideline you for weeks or months. Rest and recover when needed.'
      ],
      keyTakeaway: 'Form over weight, warm-ups over skipping—injury prevention enables long-term gains'
    }
  },
  
  'fitness-lesson-6': {
    id: 'fitness-lesson-6',
    pillarKey: 'fitness',
    number: 6,
    title: 'Recovery and Rest Days',
    duration: '5 min',
    difficulty: 'Beginner',
    content: {
      paragraphs: [
        'Rest days aren\'t lazy—they\'re strategic. When you strength train, you create microscopic tears in muscle fibers. During rest, your body repairs these tears, making muscles stronger and larger. Without adequate rest, you\'re breaking down tissue faster than you can rebuild it, leading to overtraining, fatigue, and injury.',
        'Plan at least 1-2 full rest days per week. A rest day doesn\'t mean lying on the couch all day (though that\'s fine too). You can do light activity: walking, gentle yoga, swimming, or stretching. The key is avoiding intense training that taxes the same muscle groups.',
        'Pay attention to recovery signals. Persistent fatigue, declining performance, mood changes, disrupted sleep, or elevated resting heart rate indicate your body needs more rest. When in doubt, take an extra rest day. One extra rest day won\'t hurt your progress, but training through exhaustion can set you back weeks.',
        'Active recovery accelerates healing. Light movement increases blood flow to muscles, delivering nutrients and removing waste products. A 20-minute walk or gentle stretching session on rest days can actually speed recovery compared to complete inactivity.'
      ],
      keyTakeaway: 'Muscles grow during rest, not workouts—recovery is when progress happens'
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
    title: 'Understanding Credit Scores',
    duration: '8 min',
    difficulty: 'Intermediate',
    content: {
      paragraphs: [
        'Your credit score is a three-digit number that determines your financial opportunities: mortgage rates, car loans, apartment rentals, even job prospects. Scores range from 300-850. Above 700 is good, above 750 is excellent. Below 650 makes borrowing expensive or impossible.',
        'Five factors determine your score: payment history (35%)—pay on time, every time; credit utilization (30%)—keep balances below 30% of limits; length of credit history (15%)—older accounts help; credit mix (10%)—having different types helps slightly; new credit (10%)—too many recent inquiries hurt.',
        'Build credit strategically: get a secured credit card if you\'re starting from zero, use it for small purchases, and pay the full balance monthly. Never carry a balance to "build credit"—that\'s a myth that costs you interest. On-time payments and low utilization build credit. Paying interest does nothing extra.',
        'Check your credit report annually for free at AnnualCreditReport.com. Look for errors, fraudulent accounts, or incorrect late payments. Dispute any errors immediately—they can drag your score down unfairly. Monitoring your credit helps you catch identity theft early and understand what\'s helping or hurting your score.'
      ],
      keyTakeaway: 'Pay on time, keep balances low—credit scores unlock financial opportunities'
    }
  },
  
  'finance-lesson-5': {
    id: 'finance-lesson-5',
    pillarKey: 'finance',
    number: 5,
    title: 'Investing for Beginners',
    duration: '10 min',
    difficulty: 'Intermediate',
    content: {
      paragraphs: [
        'Investing grows wealth through compound returns. When you earn returns on your initial investment plus returns on those returns, growth becomes exponential over decades. €1,000 invested at 8% annual returns becomes €10,000 in 30 years without adding another euro. Time is your greatest asset.',
        'Start with tax-advantaged accounts: retirement accounts offer tax benefits that accelerate growth. In the US, that\'s a 401(k) or IRA. In Europe, look for pension schemes or ISAs. Max out employer matches first—that\'s free money. Then contribute what you can afford monthly.',
        'Invest in low-cost index funds, not individual stocks. Index funds own hundreds or thousands of companies, spreading risk. When the overall market grows, you grow with it. Individual stock picking requires expertise, time, and luck. Index investing requires only patience and consistency.',
        'Ignore market timing. Nobody—not professionals, not billionaires—can consistently predict market highs and lows. Instead, use dollar-cost averaging: invest the same amount monthly regardless of market conditions. You\'ll buy more shares when prices are low and fewer when prices are high, averaging out your cost over time. Stay invested through market drops. Historically, markets always recover and reach new highs given enough time.'
      ],
      keyTakeaway: 'Invest early, invest consistently, think decades—compound growth builds wealth'
    }
  },
  
  'finance-lesson-6': {
    id: 'finance-lesson-6',
    pillarKey: 'finance',
    number: 6,
    title: 'Debt Payoff Strategies',
    duration: '7 min',
    difficulty: 'Intermediate',
    content: {
      paragraphs: [
        'Debt comes in two categories: "good debt" that can build wealth (like mortgages or education loans with reasonable rates) and "bad debt" that drains wealth (high-interest credit cards, payday loans, consumer debt). Bad debt is an emergency—every month you carry it, you\'re throwing money away on interest instead of building your future.',
        'Choose your payoff strategy: debt avalanche (highest interest rate first) or debt snowball (smallest balance first). Avalanche saves the most money mathematically. Snowball provides quick psychological wins. Both work if you stick with them. Pick the one that keeps you motivated.',
        'Make minimum payments on all debts, then throw every extra euro at your target debt. When that\'s eliminated, roll that payment into the next debt. Your payment amount stays the same, but the impact accelerates as debts disappear. This creates momentum—the "snowball" or "avalanche" effect.',
        'Stop adding new debt while paying off old debt. This is non-negotiable. Cut up credit cards if needed. Use cash or debit only. Every euro spent on interest is a euro not building your emergency fund, not invested, not spent on things that matter. Get angry about debt—let that anger fuel your intensity to eliminate it fast.'
      ],
      keyTakeaway: 'Choose your method, attack aggressively—debt freedom unlocks financial opportunity'
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
    title: 'Overcoming Creative Blocks',
    duration: '6 min',
    difficulty: 'Intermediate',
    content: {
      paragraphs: [
        'Creative blocks happen when your inner critic overpowers your inner creator. You sit down to make something, and suddenly everything you produce feels terrible. The blank page stays blank. This isn\'t a lack of ideas—it\'s fear masquerading as "not feeling inspired."',
        'Lower the stakes by giving yourself permission to create garbage. Tell yourself "I\'m going to make the worst painting possible" or "I\'m going to write the most boring paragraph ever." Paradoxically, removing the pressure to create something good often unlocks flow. You can always improve garbage. You can\'t improve nothing.',
        'Change your environment or medium when stuck. If writing feels impossible, switch to sketching. If painting feels blocked, try photography. Movement breaks help too—a 10-minute walk often brings clarity that sitting and staring at a screen never will. Your brain keeps problem-solving in the background.',
        'Use constraints to spark creativity. Limits force creative solutions. Try the Pomodoro technique: create for 25 minutes, no editing, no judgment. Or limit yourself to three colors, 50 words, or five minutes. Constraints eliminate decision paralysis and push you toward action.'
      ],
      keyTakeaway: 'Lower the stakes, change the environment—action beats perfection every time'
    }
  },
  
  'hobbies-lesson-5': {
    id: 'hobbies-lesson-5',
    pillarKey: 'hobbies',
    number: 5,
    title: 'Building a Practice Routine',
    duration: '8 min',
    difficulty: 'Intermediate',
    content: {
      paragraphs: [
        'Deliberate practice—focused, structured repetition with immediate feedback—is how mastery happens. Random noodling feels good but doesn\'t drive improvement. A practice routine focuses your limited time on high-leverage activities that directly improve your weakest areas.',
        'Structure your practice sessions: Start with a 5-minute warm-up (scales if music, gesture drawing if art, freewriting if writing). Then spend 70% of your time on deliberate practice—working specifically on your weakest skill. End with 10 minutes of free creation—playing, exploring, having fun. This structure balances growth with enjoyment.',
        'Identify your current bottleneck—the skill that, if improved, would elevate everything else. Can\'t keep rhythm? Focus exclusively on timing exercises for two weeks. Struggle with proportions in drawing? Drill proportions daily. Attack weaknesses systematically rather than practicing only what you\'re already good at.',
        'Track progress with specific metrics. Record yourself playing an instrument weekly. Take photos of your art progression monthly. Save writing samples to review quarterly. Concrete progress evidence keeps you motivated when improvement feels slow. You\'re always better than you were three months ago—you just forget without documentation.'
      ],
      keyTakeaway: 'Target weaknesses systematically—focused practice beats random repetition'
    }
  },
  
  'hobbies-lesson-6': {
    id: 'hobbies-lesson-6',
    pillarKey: 'hobbies',
    number: 6,
    title: 'Sharing Your Work',
    duration: '7 min',
    difficulty: 'Intermediate',
    content: {
      paragraphs: [
        'Sharing creative work feels vulnerable. What if people don\'t like it? What if they judge you? This fear keeps countless projects hidden in drawers and hard drives. But sharing is essential for growth—feedback shows you what works, community keeps you motivated, and accountability pushes you to finish projects.',
        'Start small and specific. Don\'t announce "I\'m now a writer" on social media and share nothing. Instead, post one paragraph to a writing group. Share one sketch with a trusted friend. Show one song to a musician you respect. Small shares build confidence without triggering overwhelming vulnerability.',
        'Reframe criticism as data, not judgment. When someone says "the perspective feels off" in your drawing, they\'re identifying an area to improve, not attacking your worth as a person. Separate your identity from your creations. You are not your work. Your work is simply your current skill level expressed through practice.',
        'Find your audience gradually. Join online communities in your creative field. Share work-in-progress, not just finished pieces. Ask specific questions: "Does this melody feel too repetitive?" or "Is this character believable?" Specific asks get useful feedback. General "what do you think?" gets polite platitudes. Build relationships with other creators who understand the process, not just consumers who judge the result.'
      ],
      keyTakeaway: 'Share small, seek feedback, separate self from work—community accelerates growth'
    }
  },
};
