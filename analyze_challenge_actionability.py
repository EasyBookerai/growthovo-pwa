#!/usr/bin/env python3
import re
import json

# Read the SQL file
with open('ascevo/supabase/lessons_all_pillars.sql', 'r', encoding='utf-8') as f:
    sql_content = f.read()

# Split into lesson blocks
lesson_pattern = r"INSERT INTO lessons \(id, unit_id, title, display_order, card_concept, card_example, card_mistake, card_science, card_challenge\) VALUES\s*([\s\S]*?)(?=INSERT INTO lessons|$)"
lesson_blocks = re.findall(lesson_pattern, sql_content)

print(f"Found {len(lesson_blocks)} lesson blocks\n")

# Criteria patterns
immediate_triggers = re.compile(r'\b(Right now|Today|Next time|In your next|This week|Tomorrow|Before|After|When you)\b', re.I)
time_constraint = re.compile(r'\b(\d+\s+(minute|second|hour|day|week)|under \d+|<\d+|less than \d+|for \d+)\b', re.I)
reflection_prompt = re.compile(r'\b(Notice|Pay attention|Observe|Watch|See what|Feel how|Track|Write down|Count|Record)\b', re.I)

issues_found = []
passed_challenges = []
total_lessons = 0

for block in lesson_blocks:
    # Extract individual lessons from the block (can have multiple lessons in one INSERT)
    # Pattern: ('lesson_id','unit_id','title',display_order,'card1','card2','card3','card4','card5'),
    lesson_pattern_individual = r"\('([^']+)','([^']+)','([^']+)',(\d+),\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)'\)"
    
    lessons_in_block = re.finditer(lesson_pattern_individual, block)
    
    for lesson_match in lessons_in_block:
        lesson_id = lesson_match.group(1)
        unit_id = lesson_match.group(2)
        title = lesson_match.group(3)
        display_order = lesson_match.group(4)
        
        # Cards: concept(5), example(6), mistake(7), science(8), challenge(9)
        challenge_card = lesson_match.group(9).replace("''", "'").strip()
        
        if not challenge_card or len(challenge_card) < 10:
            issues_found.append({
                'lessonId': lesson_id,
                'title': title,
                'issues': ['Missing or empty challenge card'],
                'challengeCard': challenge_card or '(empty)',
                'wordCount': 0
            })
            total_lessons += 1
            continue
        
        total_lessons += 1
        issues = []
        
        # Check criteria
        # 1. Immediate trigger
        if not immediate_triggers.search(challenge_card):
            issues.append('Missing immediate trigger (e.g., "Right now", "Today", "Next time")')
        
        # 2. Time constraint
        if not time_constraint.search(challenge_card):
            issues.append('Missing specific time constraint')
        
        # 3. Reflection prompt
        if not reflection_prompt.search(challenge_card):
            issues.append('Missing reflection prompt (e.g., "Notice what happens")')
        
        # 4. Length check
        if len(challenge_card) > 400:
            issues.append('Challenge may be too long/complex (>400 chars)')
        
        # 5. Word count (target: 50-75 words)
        word_count = len(challenge_card.split())
        if word_count < 30:
            issues.append(f'Too short ({word_count} words, target: 50-75)')
        elif word_count > 100:
            issues.append(f'Too long ({word_count} words, target: 50-75)')
        
        if issues:
            issues_found.append({
                'lessonId': lesson_id,
                'title': title,
                'issues': issues,
                'challengeCard': challenge_card,
                'wordCount': word_count
            })
        else:
            passed_challenges.append({
                'lessonId': lesson_id,
                'title': title,
                'wordCount': word_count
            })

# Generate report
print('=' * 80)
print('CHALLENGE ACTIONABILITY REVIEW REPORT')
print('=' * 80)
print(f'\nTotal Lessons Reviewed: {total_lessons}')
print(f'Challenges Passed: {len(passed_challenges)} ({round(len(passed_challenges)/total_lessons*100)}%)')
print(f'Challenges With Issues: {len(issues_found)} ({round(len(issues_found)/total_lessons*100)}%)')

print('\n' + '=' * 80)
print('ISSUES BY CATEGORY')
print('=' * 80)

# Count issue types
issue_types = {}
for item in issues_found:
    for issue in item['issues']:
        issue_types[issue] = issue_types.get(issue, 0) + 1

for issue, count in sorted(issue_types.items(), key=lambda x: x[1], reverse=True):
    print(f'\n{issue}: {count} lessons')

print('\n' + '=' * 80)
print('DETAILED ISSUES (First 20)')
print('=' * 80)

for idx, item in enumerate(issues_found[:20], 1):
    print(f'\n{idx}. {item["title"]}')
    print(f'   ID: {item["lessonId"]}')
    print(f'   Word Count: {item.get("wordCount", "N/A")}')
    print(f'   Issues:')
    for issue in item['issues']:
        print(f'   - {issue}')
    challenge_preview = item['challengeCard'][:200]
    if len(item['challengeCard']) > 200:
        challenge_preview += '...'
    print(f'   Challenge Card: "{challenge_preview}"')

print('\n' + '=' * 80)
print('SUMMARY & RECOMMENDATIONS')
print('=' * 80)

top_issues = sorted(issue_types.items(), key=lambda x: x[1], reverse=True)[:3]
print(f'''
FINDINGS:
- {len(issues_found)} of {total_lessons} challenges need attention
- Most common issues:''')
for issue, count in top_issues:
    print(f'  • {issue} ({count} challenges)')

print('''
RECOMMENDATIONS:
1. Add immediate triggers to challenges missing them
2. Include specific time constraints (e.g., "5 minutes", "today", "before bed")
3. Add reflection prompts (e.g., "Notice what happens when...", "Track how you feel...")
4. Ensure challenges are completable in under 10 minutes
5. Target 50-75 words per challenge card

NEXT STEPS:
1. Review flagged challenges manually
2. Update SQL file with improved challenge cards
3. Re-run this analysis to verify improvements
''')

# Save detailed report to file
report_data = {
    'summary': {
        'totalLessons': total_lessons,
        'passed': len(passed_challenges),
        'needsWork': len(issues_found),
        'passRate': round(len(passed_challenges)/total_lessons*100)
    },
    'issueTypes': issue_types,
    'issuesFound': issues_found,
    'passedChallenges': passed_challenges
}

with open('challenge_actionability_report.json', 'w', encoding='utf-8') as f:
    json.dump(report_data, f, indent=2, ensure_ascii=False)

print('\nDetailed report saved to: challenge_actionability_report.json')
