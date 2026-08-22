#!/usr/bin/env python3
"""
Script to extract and analyze all challenge cards from lessons_all_pillars.sql
Focus: actionability, time-bound nature, <10 minute completability, clear success criteria
"""

import re
import json

def extract_challenges(sql_file_path):
    """Extract all challenge cards from the SQL file"""
    with open(sql_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all INSERT INTO lessons statements
    # Pattern: card_challenge) VALUES followed by lesson data
    # The challenge is the last field before the closing );
    
    pattern = r"INSERT INTO lessons.*?VALUES\s+(.*?)(?=\n\nINSERT|\n\n--|\Z)"
    matches = re.findall(pattern, content, re.DOTALL)
    
    challenges = []
    lesson_pattern = r"\('([^']+)','[^']+','([^']+)',\d+,\s*'(?:[^']|'')*',\s*'(?:[^']|'')*',\s*'(?:[^']|'')*',\s*'(?:[^']|'')*',\s*'((?:[^']|'')*)'\)"
    
    for match in matches:
        # Each match is a series of lesson entries
        lesson_matches = re.findall(lesson_pattern, match)
        for lesson_match in lesson_matches:
            lesson_id = lesson_match[0]
            title = lesson_match[1]
            challenge_text = lesson_match[2].replace("''", "'")
            
            challenges.append({
                'id': lesson_id,
                'title': title,
                'challenge': challenge_text
            })
    
    return challenges

def analyze_challenge(challenge_data):
    """Analyze a challenge for quality criteria"""
    challenge = challenge_data['challenge']
    title = challenge_data['title']
    
    issues = []
    
    # Check 1: Time-bound (should contain timing words)
    time_indicators = ['right now', 'today', 'tomorrow', 'this week', 'next time', 'tonight', 
                      'in the next', 'before', 'after', 'when you', 'for 5 minutes', 
                      'for 10 minutes', 'for X minutes', 'within', 'days', 'seconds', 'minutes']
    has_time_bound = any(indicator in challenge.lower() for indicator in time_indicators)
    
    if not has_time_bound:
        issues.append("⚠️ NO TIME-BOUND ELEMENT - Missing 'right now', 'today', or specific timeframe")
    
    # Check 2: Specific action (should have imperative verbs)
    action_verbs = ['write', 'record', 'set', 'do', 'try', 'say', 'ask', 'tell', 'make',
                   'take', 'notice', 'count', 'find', 'choose', 'pick', 'create', 'start']
    has_action = any(verb in challenge.lower()[:100] for verb in action_verbs)  # Check first 100 chars
    
    if not has_action:
        issues.append("⚠️ WEAK ACTION - No clear imperative verb in opening")
    
    # Check 3: Success criteria (should have "notice" or measurement)
    success_indicators = ['notice', 'write down', 'count', 'measure', 'track', 'compare', 
                         'see if', 'check', 'watch', 'observe', 'record', 'did you']
    has_success_criteria = any(indicator in challenge.lower() for indicator in success_indicators)
    
    if not has_success_criteria:
        issues.append("⚠️ UNCLEAR SUCCESS CRITERIA - No 'notice', measurement, or reflection prompt")
    
    # Check 4: Length (should be 50-75 words, allow up to 100)
    word_count = len(challenge.split())
    if word_count > 100:
        issues.append(f"⚠️ TOO LONG - {word_count} words (target: 50-75, max: 100)")
    elif word_count < 30:
        issues.append(f"⚠️ TOO SHORT - {word_count} words (target: 50-75)")
    
    # Check 5: Complexity (should be doable in <10 minutes)
    complexity_flags = ['research', 'study', 'read a book', 'complete course', 'master',
                       'learn to', 'become', 'develop over', 'practice for weeks']
    seems_complex = any(flag in challenge.lower() for flag in complexity_flags)
    
    if seems_complex:
        issues.append("⚠️ POSSIBLY TOO COMPLEX - May take >10 minutes")
    
    # Check 6: Vague challenges
    vague_phrases = ['try to', 'think about', 'consider', 'reflect on', 'be more', 'work on']
    is_vague = any(phrase in challenge.lower()[:50] for phrase in vague_phrases)
    
    if is_vague:
        issues.append("⚠️ VAGUE ACTION - Opens with 'try to', 'think about', or similar weak phrasing")
    
    return {
        'title': title,
        'challenge': challenge[:150] + '...' if len(challenge) > 150 else challenge,
        'word_count': word_count,
        'issues': issues,
        'quality_score': 6 - len(issues)  # 6 checks, perfect score = 6
    }

def main():
    sql_file = 'ascevo/supabase/lessons_all_pillars.sql'
    
    print("Extracting challenges from SQL file...")
    challenges = extract_challenges(sql_file)
    print(f"Found {len(challenges)} challenges\n")
    
    print("="*80)
    print("CHALLENGE QUALITY ANALYSIS - Task 4.3")
    print("="*80)
    print("\nCriteria:")
    print("✓ Specific and time-bound")
    print("✓ Completable in <10 minutes")
    print("✓ Clear success criteria / reflection prompt")
    print("✓ Direct connection to lesson concept")
    print("\n" + "="*80 + "\n")
    
    # Analyze all challenges
    analyzed = []
    for i, challenge_data in enumerate(challenges, 1):
        analysis = analyze_challenge(challenge_data)
        analysis['number'] = i
        analysis['id'] = challenge_data['id']
        analyzed.append(analysis)
    
    # Separate into high quality and needs improvement
    high_quality = [a for a in analyzed if a['quality_score'] >= 5]
    needs_improvement = [a for a in analyzed if a['quality_score'] < 5]
    
    print(f"SUMMARY:")
    print(f"  Total Challenges: {len(analyzed)}")
    print(f"  High Quality (score 5-6): {len(high_quality)} ({len(high_quality)/len(analyzed)*100:.1f}%)")
    print(f"  Needs Improvement (score <5): {len(needs_improvement)} ({len(needs_improvement)/len(analyzed)*100:.1f}%)")
    print("\n" + "="*80 + "\n")
    
    if needs_improvement:
        print(f"CHALLENGES NEEDING IMPROVEMENT ({len(needs_improvement)} total):\n")
        for analysis in needs_improvement:
            print(f"Lesson #{analysis['number']}: {analysis['title']}")
            print(f"  Quality Score: {analysis['quality_score']}/6")
            print(f"  Word Count: {analysis['word_count']}")
            for issue in analysis['issues']:
                print(f"  {issue}")
            print(f"  Challenge: {analysis['challenge']}")
            print()
    else:
        print("✓ ALL CHALLENGES MEET QUALITY CRITERIA!\n")
    
    # Save detailed report
    with open('challenge_analysis_report.json', 'w') as f:
        json.dump({
            'total': len(analyzed),
            'high_quality': len(high_quality),
            'needs_improvement': len(needs_improvement),
            'challenges': analyzed
        }, f, indent=2)
    
    print("="*80)
    print(f"Detailed report saved to: challenge_analysis_report.json")
    print("="*80)

if __name__ == '__main__':
    main()
