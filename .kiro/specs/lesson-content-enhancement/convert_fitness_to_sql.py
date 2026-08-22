#!/usr/bin/env python3
"""
Convert FITNESS_LESSONS_COMPLETE.md to SQL INSERT statements
"""

import re
import sys

def escape_sql(text):
    """Escape single quotes for SQL"""
    return text.replace("'", "''")

def parse_lesson(lesson_text, unit_num, lesson_num):
    """Extract lesson components from markdown text"""
    # Extract title
    title_match = re.search(r'### Lesson \d+: (.+)', lesson_text)
    title = title_match.group(1) if title_match else ""
    
    # Extract cards
    concept_match = re.search(r'\*\*Concept:\*\*\s+(.+?)(?=\*\*Example:\*\*)', lesson_text, re.DOTALL)
    example_match = re.search(r'\*\*Example:\*\*\s+(.+?)(?=\*\*Mistake:\*\*)', lesson_text, re.DOTALL)
    mistake_match = re.search(r'\*\*Mistake:\*\*\s+(.+?)(?=\*\*Science:\*\*)', lesson_text, re.DOTALL)
    science_match = re.search(r'\*\*Science:\*\*\s+(.+?)(?=\*\*Challenge:\*\*)', lesson_text, re.DOTALL)
    challenge_match = re.search(r'\*\*Challenge:\*\*\s+(.+?)(?=---|$)', lesson_text, re.DOTALL)
    
    concept = concept_match.group(1).strip() if concept_match else ""
    example = example_match.group(1).strip() if example_match else ""
    mistake = mistake_match.group(1).strip() if mistake_match else ""
    science = science_match.group(1).strip() if science_match else ""
    challenge = challenge_match.group(1).strip() if challenge_match else ""
    
    return {
        'title': title,
        'concept': concept,
        'example': example,
        'mistake': mistake,
        'science': science,
        'challenge': challenge,
        'unit_num': unit_num,
        'lesson_num': lesson_num
    }

def generate_uuid(unit_num, lesson_num):
    """Generate lesson UUID: 33333333-0200-00UU-0000-00000000000L"""
    return f"33333333-0200-00{unit_num:02d}-0000-00000000000{lesson_num}"

def generate_unit_uuid(unit_num):
    """Generate unit UUID: 22222222-0200-00UU-0000-000000000000"""
    return f"22222222-0200-00{unit_num:02d}-0000-000000000000"

def main():
    # Read the markdown file
    with open('.kiro/specs/lesson-content-enhancement/FITNESS_LESSONS_COMPLETE.md', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split into units
    units = re.split(r'## UNIT \d+:', content)
    
    sql_output = []
    sql_output.append("-- ============================================================")
    sql_output.append("-- FITNESS PILLAR (Pillar 02) - All 40 Lessons")
    sql_output.append("-- ============================================================")
    sql_output.append("-- Generated from FITNESS_LESSONS_COMPLETE.md")
    sql_output.append("-- UUID Scheme:")
    sql_output.append("--   Units:   22222222-0200-00UU-0000-000000000000 (UU = 01-05)")
    sql_output.append("--   Lessons: 33333333-0200-00UU-0000-00000000000L (UU = unit, L = lesson 1-8)")
    sql_output.append("-- ")
    sql_output.append("-- Pillar ID: 11111111-0000-0000-0000-000000000002 (Fitness)")
    sql_output.append("--")
    sql_output.append("")
    
    # Generate Unit INSERTs
    unit_titles = [
        "Movement Foundations",
        "Strength Building",
        "Cardio & Endurance",
        "Nutrition Basics",
        "Recovery & Longevity"
    ]
    
    sql_output.append("-- ============================================================")
    sql_output.append("-- FITNESS UNITS")
    sql_output.append("-- ============================================================")
    sql_output.append("INSERT INTO units (id, pillar_id, title, display_order) VALUES")
    
    unit_inserts = []
    for i, title in enumerate(unit_titles, 1):
        unit_id = generate_unit_uuid(i)
        unit_inserts.append(f"  ('{unit_id}', '11111111-0000-0000-0000-000000000002', '{title}', {i})")
    
    sql_output.append(",\n".join(unit_inserts) + ";")
    sql_output.append("")
    
    # Parse lessons from each unit
    for unit_idx, unit_text in enumerate(units[1:], 1):  # Skip first split (header)
        unit_match = re.search(r'^([^\n]+)', unit_text)
        unit_name = unit_match.group(1).strip() if unit_match else f"Unit {unit_idx}"
        
        sql_output.append("-- ============================================================")
        sql_output.append(f"-- FITNESS — Unit {unit_idx}: {unit_name}")
        sql_output.append("-- ============================================================")
        
        # Split unit into lessons
        lessons = re.split(r'(?=### Lesson \d+:)', unit_text)
        
        lesson_inserts = []
        for lesson_text in lessons:
            if not lesson_text.strip() or '###' not in lesson_text:
                continue
            
            # Extract lesson number
            lesson_num_match = re.search(r'### Lesson (\d+):', lesson_text)
            if not lesson_num_match:
                continue
            
            global_lesson_num = int(lesson_num_match.group(1))
            local_lesson_num = ((global_lesson_num - 1) % 8) + 1
            
            lesson = parse_lesson(lesson_text, unit_idx, local_lesson_num)
            
            if not lesson['title']:
                continue
            
            lesson_id = generate_uuid(unit_idx, local_lesson_num)
            unit_id = generate_unit_uuid(unit_idx)
            
            # Build INSERT statement
            insert = f"('{lesson_id}','{unit_id}','{escape_sql(lesson['title'])}',{local_lesson_num},\n"
            insert += f"'{escape_sql(lesson['concept'])}',\n"
            insert += f"'{escape_sql(lesson['example'])}',\n"
            insert += f"'{escape_sql(lesson['mistake'])}',\n"
            insert += f"'{escape_sql(lesson['science'])}',\n"
            insert += f"'{escape_sql(lesson['challenge'])}')"
            
            lesson_inserts.append(insert)
        
        if lesson_inserts:
            sql_output.append("INSERT INTO lessons (id, unit_id, title, display_order, card_concept, card_example, card_mistake, card_science, card_challenge) VALUES")
            sql_output.append(",\n\n".join(lesson_inserts) + ";")
            sql_output.append("")
    
    # Write output
    output_path = '.kiro/specs/lesson-content-enhancement/fitness_pillar.sql'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_output))
    
    print(f"✅ SQL file generated: {output_path}")
    print(f"✅ Processed {len(unit_titles)} units")

if __name__ == '__main__':
    main()
