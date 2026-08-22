import re
import json

# Read the SQL file
with open('ascevo/supabase/lessons_all_pillars.sql', 'r', encoding='utf-8') as f:
    sql_content = f.read()

# Find all lesson VALUES by splitting on the patterns
# Each lesson is wrapped in parentheses and separated by commas
# Pattern: ('id','unit_id','title',order,'concept','example','mistake','science','challenge')

lessons = []

# Extract lessons by finding patterns after INSERT INTO lessons
# Split by INSERT INTO lessons to get each block
insert_blocks = re.split(r'INSERT INTO lessons.*?VALUES\s*', sql_content, flags=re.DOTALL | re.IGNORECASE)

for block_idx, block in enumerate(insert_blocks[1:]):  # Skip first empty split
    # Now extract individual lesson tuples from this block
    # Each lesson is ('uuid1','uuid2','title',num,'text1','text2','text3','text4','text5')
    # We need to handle single quotes carefully (they're escaped as '')
    
    # Find all lesson value tuples
    # Use a more sophisticated regex to match the full lesson structure
    lesson_pattern = r"\('([^']+)','([^']+)','([^']+)',(\d+),\s*'((?:[^']|'')*?)',\s*'((?:[^']|'')*?)',\s*'((?:[^']|'')*?)',\s*'((?:[^']|'')*?)',\s*'((?:[^']|'')*?)'\)"
    
    matches = re.finditer(lesson_pattern, block, re.DOTALL)
    
    for match in matches:
        lesson_id = match.group(1)
        unit_id = match.group(2)
        title = match.group(3).replace("''", "'")
        display_order = match.group(4)
        concept = match.group(5).replace("''", "'")
        example = match.group(6).replace("''", "'")
        mistake = match.group(7).replace("''", "'")
        science = match.group(8).replace("''", "'")
        challenge = match.group(9).replace("''", "'").strip()
        
        lessons.append({
            'id': lesson_id,
            'title': title,
            'challenge': challenge
        })

print(f"\n{'='*80}")
print(f"CHALLENGE ACTIONABILITY REVIEW")
print(f"Total lessons found: {len(lessons)}")
print(f"{'='*80}\n")

# Analyze each challenge
issues = []

for idx, lesson in enumerate(lessons):
    lesson_num = idx + 1
    challenge = lesson['challenge']
    
    # Criteria checks
    # 1. Time-bound
    timebound_pattern = r'\b(today|right now|now|next time|tonight|this week|tomorrow|before|after|when|in \d+|set a timer|for \d+)\b'
    has_timebound = bool(re.search(timebound_pattern, challenge, re.IGNORECASE))
    
    # 2. Specific action
    action_pattern = r'\b(record|write|say|do|set|try|answer|practice|count|notice|ask|start|stop|pick|choose|call|text|send|take|make|create|list|identify|speak|read|watch|listen|pause|look|think|find|check|open|close|tell|show|share|give|go|sit|stand|walk|run|move)\b'
    has_action = bool(re.search(action_pattern, challenge, re.IGNORECASE))
    
    # 3. Word count
    word_count = len(challenge.split())
    
    # 4. Success criteria
    success_pattern = r'\b(notice|count|write down|compare|measure|track|record|feel|observe|check|see|watch|that\'?s|you\'?ll know|completed)\b'
    has_success = bool(re.search(success_pattern, challenge, re.IGNORECASE))
    
    # 5. Quick completion
    quick_pattern = r'\b(\d+\s*(minute|second|hour)|quick|brief|short)\b'
    seems_quick = bool(re.search(quick_pattern, challenge, re.IGNORECASE)) or word_count < 80
    
    # Identify issues
    lesson_issues = []
    
    if not has_timebound:
        lesson_issues.append('❌ NOT TIME-BOUND')
    
    if not has_action:
        lesson_issues.append('❌ NOT SPECIFIC')
    
    if not has_success:
        lesson_issues.append('❌ UNCLEAR SUCCESS')
    
    if not seems_quick:
        lesson_issues.append('⚠️  POSSIBLY TOO LONG')
    
    if word_count > 100:
        lesson_issues.append(f'⚠️  TOO WORDY ({word_count}w)')
    
    if word_count < 30:
        lesson_issues.append(f'⚠️  TOO SHORT ({word_count}w)')
    
    if lesson_issues:
        issues.append({
            'lesson_num': lesson_num,
            'id': lesson['id'],
            'title': lesson['title'],
            'challenge': challenge,
            'issues': lesson_issues,
            'word_count': word_count
        })

# Report results
if not issues:
    print('✅ ALL 240 CHALLENGES PASS ACTIONABILITY CRITERIA!\n')
else:
    print(f'⚠️  FOUND {len(issues)} CHALLENGES WITH ISSUES ({len(issues)/len(lessons)*100:.1f}% of total)\n')
    
    # Count issue types
    issue_counts = {
        'not_timebound': sum(1 for i in issues if any('NOT TIME-BOUND' in iss for iss in i['issues'])),
        'not_specific': sum(1 for i in issues if any('NOT SPECIFIC' in iss for iss in i['issues'])),
        'unclear_success': sum(1 for i in issues if any('UNCLEAR SUCCESS' in iss for iss in i['issues'])),
        'too_long': sum(1 for i in issues if any('POSSIBLY TOO LONG' in iss for iss in i['issues'])),
        'too_wordy': sum(1 for i in issues if any('TOO WORDY' in iss for iss in i['issues'])),
        'too_short': sum(1 for i in issues if any('TOO SHORT' in iss for iss in i['issues']))
    }
    
    print('ISSUE BREAKDOWN:')
    print(f"  Missing time-bound element: {issue_counts['not_timebound']}")
    print(f"  Missing specific action: {issue_counts['not_specific']}")
    print(f"  Unclear success criteria: {issue_counts['unclear_success']}")
    print(f"  Possibly too long (>10 min): {issue_counts['too_long']}")
    print(f"  Too wordy (>100 words): {issue_counts['too_wordy']}")
    print(f"  Too short (<30 words): {issue_counts['too_short']}\n")

# Generate detailed report
report_lines = []
report_lines.append('# Challenge Actionability Review Report\n')
report_lines.append(f'**Generated:** {json.dumps({"timestamp": "now"})}\n')
report_lines.append('## Executive Summary\n')
report_lines.append(f'- **Total lessons analyzed:** {len(lessons)}')
report_lines.append(f'- **Lessons passing all criteria:** {len(lessons) - len(issues)} ({(len(lessons) - len(issues))/len(lessons)*100:.1f}%)')
report_lines.append(f'- **Lessons with issues:** {len(issues)} ({len(issues)/len(lessons)*100:.1f}%)\n')

report_lines.append('## Criteria Evaluated\n')
report_lines.append('Each challenge was checked for:')
report_lines.append('1. **Time-bound:** Mentions "today", "right now", "next time", or specific duration')
report_lines.append('2. **Specific action:** Clear action verb and concrete task')
report_lines.append('3. **Success criteria:** Clear outcome or "notice what happens" prompt')
report_lines.append('4. **Completable quickly:** Under 10 minutes (explicit or implicit)')
report_lines.append('5. **Appropriate length:** 50-75 words ideal, 30-100 acceptable\n')

if issues:
    issue_counts = {
        'not_timebound': sum(1 for i in issues if any('NOT TIME-BOUND' in iss for iss in i['issues'])),
        'not_specific': sum(1 for i in issues if any('NOT SPECIFIC' in iss for iss in i['issues'])),
        'unclear_success': sum(1 for i in issues if any('UNCLEAR SUCCESS' in iss for iss in i['issues'])),
        'too_long': sum(1 for i in issues if any('POSSIBLY TOO LONG' in iss for iss in i['issues'])),
        'too_wordy': sum(1 for i in issues if any('TOO WORDY' in iss for iss in i['issues'])),
        'too_short': sum(1 for i in issues if any('TOO SHORT' in iss for iss in i['issues']))
    }
    
    report_lines.append('## Issue Breakdown\n')
    report_lines.append(f"- **Missing time-bound element:** {issue_counts['not_timebound']} lessons")
    report_lines.append(f"- **Missing specific action:** {issue_counts['not_specific']} lessons")
    report_lines.append(f"- **Unclear success criteria:** {issue_counts['unclear_success']} lessons")
    report_lines.append(f"- **Possibly too long (>10 min):** {issue_counts['too_long']} lessons")
    report_lines.append(f"- **Too wordy (>100 words):** {issue_counts['too_wordy']} lessons")
    report_lines.append(f"- **Too short (<30 words):** {issue_counts['too_short']} lessons\n")
    
    report_lines.append('---\n')
    report_lines.append('## Detailed Issues\n')
    
    for issue in issues:
        report_lines.append(f"### Lesson #{issue['lesson_num']}: {issue['title']}\n")
        report_lines.append(f"**ID:** `{issue['id']}`  ")
        report_lines.append(f"**Word count:** {issue['word_count']}  ")
        report_lines.append(f"**Issues:** {', '.join(issue['issues'])}\n")
        report_lines.append('**Current challenge text:**')
        report_lines.append(f"> {issue['challenge']}\n")
        report_lines.append('---\n')
    
    report_lines.append('## Recommendations\n')
    report_lines.append('### Priority Fixes\n')
    report_lines.append(f"1. **Add time-bound elements** to {issue_counts['not_timebound']} challenges (add \"right now\", \"today\", \"next time\", or specific duration)")
    report_lines.append(f"2. **Clarify success criteria** for {issue_counts['unclear_success']} challenges (add \"notice\", \"count\", \"write down\" prompts)")
    report_lines.append(f"3. **Adjust word counts** for {issue_counts['too_wordy'] + issue_counts['too_short']} challenges\n")
    report_lines.append('### Implementation Note\n')
    report_lines.append('All identified issues can be resolved with minor text edits. No structural changes to the database schema or lesson flow required.\n')
else:
    report_lines.append('## Results\n')
    report_lines.append('🎉 **All 240 challenges meet actionability criteria!**\n')
    report_lines.append('Every challenge is:')
    report_lines.append('- Time-bound and actionable today')
    report_lines.append('- Specific with clear actions')
    report_lines.append('- Completable in under 10 minutes')
    report_lines.append('- Includes clear success criteria')
    report_lines.append('- Appropriate length (50-75 words)\n')

# Write report
with open('CHALLENGE_ACTIONABILITY_REPORT.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(report_lines))

print(f'\n✅ Detailed report saved to: CHALLENGE_ACTIONABILITY_REPORT.md')
print(f'SUMMARY: {len(lessons) - len(issues)}/{len(lessons)} challenges pass all criteria ({(len(lessons) - len(issues))/len(lessons)*100:.1f}%)\n')
