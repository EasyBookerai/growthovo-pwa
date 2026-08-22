#!/usr/bin/env python3
"""
Extract all science cards from lessons SQL file for verification.
"""
import re
import json

def extract_science_cards(sql_file_path):
    """Extract all science cards from the SQL file."""
    with open(sql_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match lesson inserts
    # Looking for the card_science field which is the 4th text field after card_concept, card_example, card_mistake
    pattern = r"INSERT INTO lessons \(id, unit_id, title, display_order, card_concept, card_example, card_mistake, card_science, card_challenge\) VALUES\s*\((.*?)\)(?:,|\s*;)"
    
    lessons = []
    lesson_pattern = r"'([^']+?)','([^']+?)','([^']+?)',(\d+),\s*'(.*?)',\s*'(.*?)',\s*'(.*?)',\s*'(.*?)',\s*'(.*?)'\)"
    
    # Find all lesson insert statements
    inserts = re.finditer(r"\('33333333-[^)]+\)", content, re.DOTALL)
    
    for match in inserts:
        insert_text = match.group(0)
        # Extract the individual fields
        parts = re.findall(r"'([^']*(?:''[^']*)*)'", insert_text)
        if len(parts) >= 9:
            lesson_id = parts[0]
            unit_id = parts[1]
            title = parts[2]
            # display_order is not quoted
            science_card = parts[6]  # card_science is the 7th text field (0-indexed: 6)
            
            # Unescape single quotes
            science_card = science_card.replace("''", "'")
            
            lessons.append({
                'id': lesson_id,
                'unit_id': unit_id,
                'title': title,
                'science_card': science_card
            })
    
    return lessons

def extract_pillar_name(lesson_id):
    """Extract pillar code from lesson UUID."""
    # Format: 33333333-PP00-00UU-0000-00000000000L
    pillar_code = lesson_id[9:11]
    pillar_map = {
        '01': 'Mind',
        '02': 'Fitness',
        '03': 'Communication',
        '04': 'Money',
        '05': 'Career',
        '06': 'Relationships'
    }
    return pillar_map.get(pillar_code, 'Unknown')

def main():
    sql_file = 'ascevo/supabase/lessons_all_pillars.sql'
    lessons = extract_science_cards(sql_file)
    
    print(f"Extracted {len(lessons)} lessons with science cards\n")
    
    # Group by pillar
    by_pillar = {}
    for lesson in lessons:
        pillar = extract_pillar_name(lesson['id'])
        if pillar not in by_pillar:
            by_pillar[pillar] = []
        by_pillar[pillar].append(lesson)
    
    # Write to file for review
    with open('.kiro/specs/lesson-content-enhancement/science_cards_extraction.md', 'w', encoding='utf-8') as f:
        f.write("# Science Cards Extraction for Verification\n\n")
        f.write(f"Total lessons: {len(lessons)}\n\n")
        
        for pillar in sorted(by_pillar.keys()):
            f.write(f"\n## {pillar} Pillar ({len(by_pillar[pillar])} lessons)\n\n")
            for i, lesson in enumerate(by_pillar[pillar], 1):
                f.write(f"### {i}. {lesson['title']}\n\n")
                f.write(f"**Lesson ID:** `{lesson['id']}`\n\n")
                f.write(f"**Science Card:**\n{lesson['science_card']}\n\n")
                f.write("**Verification Status:** [ ] Not checked\n\n")
                f.write("**Issues Found:** None\n\n")
                f.write("**Research Verification:**\n- Institution/Researcher mentioned: \n- Finding/Study: \n- Mechanism explained: \n- Accuracy: \n\n")
                f.write("---\n\n")
    
    print(f"Science cards written to: .kiro/specs/lesson-content-enhancement/science_cards_extraction.md")
    
    # Save JSON for programmatic access
    with open('.kiro/specs/lesson-content-enhancement/science_cards.json', 'w', encoding='utf-8') as f:
        json.dump(lessons, f, indent=2, ensure_ascii=False)
    
    print(f"JSON data written to: .kiro/specs/lesson-content-enhancement/science_cards.json")

if __name__ == '__main__':
    main()
