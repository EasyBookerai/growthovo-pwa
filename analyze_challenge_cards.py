#!/usr/bin/env python3
"""
Analyze all 240 challenge cards from lessons_all_pillars.sql
Check for:
- Specificity (concrete actions vs vague goals)
- Time-bound nature (<10 minutes)
- Connection to lesson concept
- Clear success criteria
"""

import re
import json

def extract_lessons_from_sql(filepath):
    """Extract all lesson records from SQL file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all INSERT INTO lessons statements
    # Pattern: INSERT INTO lessons ... VALUES (lesson_data), (lesson_data), ...
    lessons = []
    
    # Split by INSERT INTO lessons statements
    inserts = re.findall(
        r"INSERT INTO lessons \([^)]+\) VALUES\s*\n(.*?)(?=INSERT INTO|-- ===|$)",
        content,
        re.DOTALL
    )
    
    for insert_block in inserts:
        # Split individual lesson records - each starts with ('33333333...
        lesson_matches = re.findall(
            r"\('33333333-[^']+','[^']+','([^']+)',(\d+),\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*?)'\)",
            insert_block,
            re.DOTALL
        )
        
        for match in lesson_matches:
            title, display_order, concept, example, mistake, science, challenge = match
            lessons.append({
                'title': title,
                'display_order': int(display_order),
                'card_challenge': challenge.replace("''", "'")  # Unescape SQL quotes
            })
    
    return lessons

def analyze_challenge(challenge_text, title):
    """Analyze a single challenge card."""
    issues = []
    
    # Check 1: Length (should be 50-75 words per design doc)
    word_count = len(challenge_text.split())
    if word_count < 30:
        issues.append(f"Too short ({word_count} words) - may lack detail")
    elif word_count > 100:
        issues.append(f"Too long ({word_count} words) - may be overwhelming")
    
    # Check 2: Immediacy triggers (right now, today, next time, etc.)
    immediacy_triggers = ['right now', 'today', 'next time', 'this week', 'before you', 'in your next', 'set a timer']
    has_trigger = any(trigger in challenge_text.lower() for trigger in immediacy_triggers)
    if not has_trigger:
        issues.append("Missing immediacy trigger (right now, today, next time)")
    
    # Check 3: Time-bound language
    time_indicators = ['minute', 'second', 'hour', 'day', 'week', 'tomorrow', 'tonight']
    has_time = any(indicator in challenge_text.lower() for indicator in time_indicators)
    if not has_time:
        issues.append("Not clearly time-bound")
    
    # Check 4: Specific action verbs
    action_verbs = ['write', 'record', 'call', 'send', 'ask', 'do', 'try', 'practice', 'track', 'list', 'set', 'count', 'notice', 'say', 'tell', 'read', 'open']
    has_action = any(verb in challenge_text.lower() for verb in action_verbs)
    if not has_action:
        issues.append("Lacks clear action verb")
    
    # Check 5: Reflection prompt ("notice", "observe", "pay attention")
    reflection_prompts = ['notice', 'observe', 'pay attention', 'watch', 'feel', 'see what happens']
    has_reflection = any(prompt in challenge_text.lower() for prompt in reflection_prompts)
    if not has_reflection:
        issues.append("Missing reflection prompt")
    
    # Check 6: Vague language to avoid
    vague_words = ['try to', 'work on', 'think about', 'consider', 'start thinking', 'be more']
    has_vague = any(vague in challenge_text.lower() for vague in vague_words)
    if has_vague:
        issues.append("Contains vague language")
    
    # Check 7: Success metrics (numbers, completion indicators)
    has_metric = bool(re.search(r'\d+|count|number|baseline|measure|how many', challenge_text.lower()))
    
    return {
        'title': title,
        'word_count': word_count,
        'has_immediacy': has_trigger,
        'has_time_bound': has_time,
        'has_action_verb': has_action,
        'has_reflection': has_reflection,
        'has_vague_language': has_vague,
        'has_success_metric': has_metric,
        'issues': issues,
        'challenge_text': challenge_text[:200] + '...' if len(challenge_text) > 200 else challenge_text
    }

def generate_report(lessons):
    """Generate analysis report."""
    print("=" * 80)
    print("CHALLENGE CARD ACTIONABILITY REVIEW - 240 LESSONS")
    print("=" * 80)
    print()
    
    all_issues = []
    total_lessons = len(lessons)
    
    # Aggregate statistics
    stats = {
        'has_immediacy': 0,
        'has_time_bound': 0,
        'has_action_verb': 0,
        'has_reflection': 0,
        'has_vague_language': 0,
        'has_success_metric': 0,
        'word_count_ok': 0,
        'no_issues': 0
    }
    
    for lesson in lessons:
        analysis = analyze_challenge(lesson['card_challenge'], lesson['title'])
        
        if analysis['has_immediacy']: stats['has_immediacy'] += 1
        if analysis['has_time_bound']: stats['has_time_bound'] += 1
        if analysis['has_action_verb']: stats['has_action_verb'] += 1
        if analysis['has_reflection']: stats['has_reflection'] += 1
        if analysis['has_vague_language']: stats['has_vague_language'] += 1
        if analysis['has_success_metric']: stats['has_success_metric'] += 1
        if 30 <= analysis['word_count'] <= 100: stats['word_count_ok'] += 1
        if len(analysis['issues']) == 0: stats['no_issues'] += 1
        
        if analysis['issues']:
            all_issues.append(analysis)
    
    # Print summary statistics
    print(f"SUMMARY STATISTICS ({total_lessons} lessons analyzed)")
    print("-" * 80)
    print(f"✓ Immediacy trigger present:    {stats['has_immediacy']:3d} / {total_lessons} ({stats['has_immediacy']/total_lessons*100:.1f}%)")
    print(f"✓ Time-bound language:          {stats['has_time_bound']:3d} / {total_lessons} ({stats['has_time_bound']/total_lessons*100:.1f}%)")
    print(f"✓ Clear action verb:            {stats['has_action_verb']:3d} / {total_lessons} ({stats['has_action_verb']/total_lessons*100:.1f}%)")
    print(f"✓ Reflection prompt:            {stats['has_reflection']:3d} / {total_lessons} ({stats['has_reflection']/total_lessons*100:.1f}%)")
    print(f"✓ Success metric/measurement:   {stats['has_success_metric']:3d} / {total_lessons} ({stats['has_success_metric']/total_lessons*100:.1f}%)")
    print(f"✓ Appropriate word count:       {stats['word_count_ok']:3d} / {total_lessons} ({stats['word_count_ok']/total_lessons*100:.1f}%)")
    print(f"✗ Contains vague language:      {stats['has_vague_language']:3d} / {total_lessons} ({stats['has_vague_language']/total_lessons*100:.1f}%)")
    print(f"✓ NO ISSUES FOUND:              {stats['no_issues']:3d} / {total_lessons} ({stats['no_issues']/total_lessons*100:.1f}%)")
    print()
    
    # Print detailed issues
    if all_issues:
        print(f"CHALLENGES WITH ISSUES ({len(all_issues)} lessons need attention)")
        print("-" * 80)
        for i, issue_data in enumerate(all_issues[:20], 1):  # Show first 20
            print(f"\n{i}. {issue_data['title']}")
            print(f"   Word count: {issue_data['word_count']}")
            for issue in issue_data['issues']:
                print(f"   ⚠ {issue}")
            print(f"   Challenge: {issue_data['challenge_text']}")
        
        if len(all_issues) > 20:
            print(f"\n... and {len(all_issues) - 20} more challenges with issues")
    else:
        print("✓ ALL CHALLENGES PASS QUALITY CHECKS")
    
    print()
    print("=" * 80)
    print("RECOMMENDATIONS")
    print("=" * 80)
    print()
    
    if stats['has_immediacy'] < total_lessons * 0.9:
        print("• Add immediacy triggers (right now, today, next time) to more challenges")
    
    if stats['has_time_bound'] < total_lessons * 0.85:
        print("• Make challenges more time-bound (<10 minutes ideal)")
    
    if stats['has_reflection'] < total_lessons * 0.85:
        print("• Add reflection prompts (notice what happens, observe, pay attention)")
    
    if stats['has_vague_language'] > total_lessons * 0.1:
        print("• Replace vague language (try to, work on) with specific actions")
    
    if stats['has_success_metric'] < total_lessons * 0.5:
        print("• Add clearer success criteria so users know when they've completed the challenge")
    
    if stats['no_issues'] >= total_lessons * 0.8:
        print("✓ Challenges are in excellent shape - most meet all quality criteria")
    
    print()

def main():
    lessons = extract_lessons_from_sql('ascevo/supabase/lessons_all_pillars.sql')
    print(f"Extracted {len(lessons)} lessons from SQL file\n")
    generate_report(lessons)

if __name__ == '__main__':
    main()
