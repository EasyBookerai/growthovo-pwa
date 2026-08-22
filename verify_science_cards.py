#!/usr/bin/env python3
"""
Science Card Verification Script
Extracts and analyzes all science cards from lessons_all_pillars.sql
"""

import re
import json

def extract_science_cards(sql_file_path):
    """Extract all science cards from the SQL file"""
    with open(sql_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match INSERT statements with card_science
    # The pattern captures the lesson title and the science card content
    pattern = r"INSERT INTO lessons.*?VALUES.*?\('([^']+)','([^']+)','([^']+)',(\d+),\s*'([^']*(?:''[^']*)*)'\s*,\s*'([^']*(?:''[^']*)*)'\s*,\s*'([^']*(?:''[^']*)*)'\s*,\s*'([^']*(?:''[^']*)*)'\s*,\s*'([^']*(?:''[^']*)*)'.*?\)"
    
    # Find all lessons
    lessons = []
    matches = re.finditer(pattern, content, re.DOTALL)
    
    for match in matches:
        lesson_id = match.group(1)
        title = match.group(3)
        card_science = match.group(8)
        
        # Unescape single quotes
        card_science = card_science.replace("''", "'")
        
        lessons.append({
            'id': lesson_id,
            'title': title,
            'science_card': card_science
        })
    
    return lessons

def analyze_science_card(lesson):
    """Analyze a science card for research citations and claims"""
    science_text = lesson['science_card']
    
    analysis = {
        'lesson_id': lesson['id'],
        'lesson_title': lesson['title'],
        'has_research_citation': False,
        'citation_keywords': [],
        'has_mechanism_explanation': False,
        'word_count': len(science_text.split()),
        'potential_issues': [],
        'science_card_text': science_text
    }
    
    if len(science_text.strip()) == 0:
        analysis['potential_issues'].append('Empty science card')
        return analysis
    
    # Check for research citations
    citation_patterns = [
        r'research',
        r'stud(y|ies)',
        r'(University|Harvard|Stanford|MIT|Yale|Oxford|Cambridge)',
        r'researcher',
        r'found that',
        r'shows that',
        r'published',
        r'journal'
    ]
    
    for pattern in citation_patterns:
        if re.search(pattern, science_text, re.IGNORECASE):
            analysis['has_research_citation'] = True
            analysis['citation_keywords'].append(pattern.strip('()'))
    
    # Check for mechanism explanation keywords
    mechanism_keywords = [
        'mechanism',
        'because',
        'causes',
        'triggers',
        'activates',
        'produces',
        'releases',
        'increases',
        'decreases',
        'brain',
        'neural',
        'hormone',
        'neurotransmitter',
        'cortex',
        'amygdala',
        'dopamine',
        'serotonin',
        'cortisol',
        'adrenaline',
        'physiological',
        'biological'
    ]
    
    for keyword in mechanism_keywords:
        if keyword.lower() in science_text.lower():
            analysis['has_mechanism_explanation'] = True
            break
    
    # Check for red flags (pseudoscience indicators)
    red_flags = [
        r'toxins',
        r'detox',
        r'cleanse',
        r'energy fields',
        r'vibration(al)?\s+frequency',
        r'quantum\s+(healing|energy)',
        r'chakra',
        r'big pharma',
        r'natural\s+cure'
    ]
    
    for flag in red_flags:
        if re.search(flag, science_text, re.IGNORECASE):
            analysis['potential_issues'].append(f'Red flag: {flag}')
    
    # Check for vague claims without specifics
    if not analysis['has_research_citation']:
        analysis['potential_issues'].append('No research citation found')
    
    if not analysis['has_mechanism_explanation']:
        analysis['potential_issues'].append('No mechanism explanation found')
    
    if analysis['word_count'] < 30:
        analysis['potential_issues'].append(f'Very short science card ({analysis["word_count"]} words)')
    
    return analysis

def generate_report(analyses):
    """Generate a detailed verification report"""
    report_lines = []
    report_lines.append("=" * 80)
    report_lines.append("SCIENCE ACCURACY VERIFICATION REPORT")
    report_lines.append("Lesson Content Enhancement Spec - Task 4.2")
    report_lines.append("=" * 80)
    report_lines.append("")
    
    total_lessons = len(analyses)
    lessons_with_citations = sum(1 for a in analyses if a['has_research_citation'])
    lessons_with_mechanisms = sum(1 for a in analyses if a['has_mechanism_explanation'])
    lessons_with_issues = sum(1 for a in analyses if len(a['potential_issues']) > 0)
    
    report_lines.append("SUMMARY STATISTICS")
    report_lines.append("-" * 80)
    report_lines.append(f"Total lessons analyzed: {total_lessons}")
    report_lines.append(f"Lessons with research citations: {lessons_with_citations} ({lessons_with_citations/total_lessons*100:.1f}%)")
    report_lines.append(f"Lessons with mechanism explanations: {lessons_with_mechanisms} ({lessons_with_mechanisms/total_lessons*100:.1f}%)")
    report_lines.append(f"Lessons with potential issues: {lessons_with_issues} ({lessons_with_issues/total_lessons*100:.1f}%)")
    report_lines.append("")
    
    # Group by issue type
    lessons_needing_review = [a for a in analyses if len(a['potential_issues']) > 0]
    
    if lessons_needing_review:
        report_lines.append("LESSONS REQUIRING MANUAL REVIEW")
        report_lines.append("-" * 80)
        
        for analysis in lessons_needing_review:
            report_lines.append(f"\nLesson: {analysis['lesson_title']}")
            report_lines.append(f"ID: {analysis['lesson_id']}")
            report_lines.append(f"Issues:")
            for issue in analysis['potential_issues']:
                report_lines.append(f"  - {issue}")
            report_lines.append(f"\nScience Card Text:")
            report_lines.append(f"{analysis['science_card_text'][:200]}...")
            report_lines.append("")
    
    # Check for specific high-quality examples
    report_lines.append("\n" + "=" * 80)
    report_lines.append("HIGH-QUALITY SCIENCE CARDS (Examples)")
    report_lines.append("-" * 80)
    
    high_quality = [a for a in analyses 
                   if a['has_research_citation'] 
                   and a['has_mechanism_explanation'] 
                   and len(a['potential_issues']) == 0
                   and a['word_count'] >= 60]
    
    for analysis in high_quality[:5]:  # Show first 5 examples
        report_lines.append(f"\n✓ {analysis['lesson_title']}")
        report_lines.append(f"  {analysis['science_card_text'][:150]}...")
        report_lines.append("")
    
    return "\n".join(report_lines)

def main():
    sql_file = 'ascevo/supabase/lessons_all_pillars.sql'
    
    print("Extracting science cards from SQL file...")
    lessons = extract_science_cards(sql_file)
    print(f"Found {len(lessons)} lessons")
    
    print("Analyzing science cards...")
    analyses = [analyze_science_card(lesson) for lesson in lessons]
    
    print("Generating report...")
    report = generate_report(analyses)
    
    # Write report to file
    with open('science_verification_report.txt', 'w', encoding='utf-8') as f:
        f.write(report)
    
    # Write detailed JSON for further analysis
    with open('science_verification_data.json', 'w', encoding='utf-8') as f:
        json.dump(analyses, f, indent=2)
    
    print("\nReport generated:")
    print("  - science_verification_report.txt (human-readable)")
    print("  - science_verification_data.json (detailed data)")
    print("\nPreview:\n")
    print(report[:2000])
    print("\n... (see full report in science_verification_report.txt)")

if __name__ == '__main__':
    main()
