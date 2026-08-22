#!/usr/bin/env python3
"""
Comprehensive Inclusivity & Sensitivity Analysis
Analyzes lesson content for:
1. Diversity in character names and representation
2. Harmful body image language (especially in Fitness)
3. Context and background diversity
4. Assumptions about gender, sexuality, ability
"""

import re
from collections import Counter
import json

def extract_lessons(sql_content):
    """Extract all lesson content from SQL"""
    pattern = r"INSERT INTO lessons.*?VALUES\s*\((.*?)\)(?:,|\s*;)"
    matches = re.findall(pattern, sql_content, re.DOTALL)
    
    lessons = []
    for match in matches:
        # Extract the card contents
        cards = re.findall(r"'((?:[^']|'')*)'", match)
        if len(cards) >= 6:
            lesson = {
                'id': cards[0] if len(cards) > 0 else '',
                'unit_id': cards[1] if len(cards) > 1 else '',
                'title': cards[2] if len(cards) > 2 else '',
                'card_concept': cards[4] if len(cards) > 4 else '',
                'card_example': cards[5] if len(cards) > 5 else '',
                'card_mistake': cards[6] if len(cards) > 6 else '',
                'card_science': cards[7] if len(cards) > 7 else '',
                'card_challenge': cards[8] if len(cards) > 8 else ''
            }
            lessons.append(lesson)
    
    return lessons

def extract_names_and_demographics(lessons):
    """Extract character names, ages, and contexts from example cards"""
    # Pattern: Name, age, context
    pattern = r"([A-Z][a-z]+),\s*(\d{1,2}),\s*([^.]+)"
    
    characters = []
    for lesson in lessons:
        example = lesson['card_example']
        matches = re.findall(pattern, example)
        for match in matches:
            name, age, context = match
            characters.append({
                'name': name,
                'age': int(age),
                'context': context.strip(),
                'lesson_title': lesson['title'],
                'full_example': example
            })
    
    return characters

def analyze_name_diversity(characters):
    """Analyze diversity of character names"""
    names = [c['name'] for c in characters]
    name_counts = Counter(names)
    
    # Categorize names (basic heuristic)
    european_common = ['John', 'James', 'Sarah', 'Emma', 'Tom', 'Jake', 'Ryan', 'Noah', 'Daniel', 'Ella', 'Grace', 'Leo', 'Mia', 'Chloe', 'Ava']
    global_diverse = ['Lena', 'Marcus', 'Aisha', 'Sofia', 'Zara', 'Kai', 'Priya', 'Yuki', 'Jamal', 'Fatima', 'Raj', 'Amara', 'Chen', 'Diego']
    
    european_count = sum(1 for n in names if n in european_common)
    diverse_count = sum(1 for n in names if n in global_diverse)
    other_count = len(names) - european_count - diverse_count
    
    return {
        'total_characters': len(characters),
        'unique_names': len(name_counts),
        'european_common': european_count,
        'global_diverse': diverse_count,
        'other': other_count,
        'all_names': dict(name_counts),
        'diversity_percentage': round((diverse_count / len(names) * 100), 2) if names else 0
    }

def analyze_age_distribution(characters):
    """Analyze age diversity"""
    ages = [c['age'] for c in characters]
    age_counts = Counter(ages)
    
    return {
        'age_range': f"{min(ages)}-{max(ages)}" if ages else "N/A",
        'average_age': round(sum(ages) / len(ages), 1) if ages else 0,
        'age_distribution': dict(age_counts)
    }

def analyze_context_diversity(characters):
    """Analyze diversity of contexts and situations"""
    contexts = [c['context'].lower() for c in characters]
    
    # Context categories
    academic = sum(1 for c in contexts if any(word in c for word in ['university', 'class', 'seminar', 'student', 'professor', 'presentation']))
    work = sum(1 for c in contexts if any(word in c for word in ['job', 'work', 'manager', 'interview', 'startup', 'team']))
    personal = sum(1 for c in contexts if any(word in c for word in ['friend', 'relationship', 'family', 'dating', 'partner']))
    fitness = sum(1 for c in contexts if any(word in c for word in ['gym', 'workout', 'exercise', 'running', 'fitness']))
    
    return {
        'academic': academic,
        'work': work,
        'personal': personal,
        'fitness': fitness,
        'other': len(contexts) - academic - work - personal - fitness
    }

def check_body_image_language(lessons):
    """Check for harmful body image language, especially in Fitness content"""
    problematic_terms = [
        r'\bfat\b(?! loss metabolism)',  # "fat" except in scientific context
        r'\bobese\b',
        r'\boverweight\b',
        r'\bskinny\b',
        r'\bthin\b(?! air)',
        r'\blook better\b',
        r'\blook good\b',
        r'\bbeach body\b',
        r'\bsummer body\b',
        r'\bperfect body\b',
        r'\bideal body\b',
        r'\bbody goals\b',
        r'\btransformation\b(?! in)',  # except "transformation in mindset" etc
        r'\bbefore and after\b',
        r'\bweight loss\b',
        r'\blose weight\b',
        r'\bburn fat\b',
        r'\bget ripped\b',
        r'\bget shredded\b',
        r'\bflat stomach\b',
        r'\babs\b(?! tract)',
        r'\btoned\b',
        r'\bcalorie restriction\b',
        r'\bcheat meal\b',
        r'\bcheat day\b'
    ]
    
    issues = []
    
    for lesson in lessons:
        # Check if it's a Fitness lesson (ID starts with 33333333-0200)
        is_fitness = lesson['id'].startswith('33333333-0200')
        
        all_text = f"{lesson['card_concept']} {lesson['card_example']} {lesson['card_mistake']} {lesson['card_science']} {lesson['card_challenge']}"
        
        for pattern in problematic_terms:
            matches = re.finditer(pattern, all_text, re.IGNORECASE)
            for match in matches:
                issues.append({
                    'lesson_title': lesson['title'],
                    'is_fitness': is_fitness,
                    'term': match.group(),
                    'context': all_text[max(0, match.start()-50):match.end()+50]
                })
    
    return issues

def check_gender_assumptions(lessons):
    """Check for assumptions about gender, sexuality"""
    gendered_terms = [
        r'\bboyfriend\b',
        r'\bgirlfriend\b',
        r'\bhusband\b',
        r'\bwife\b',
        r'\bhe or she\b',
        r'\bhis or her\b',
        r'\bmen and women\b',
        r'\bmale\b',
        r'\bfemale\b',
        r'\bguy\b',
        r'\bgirl\b'
    ]
    
    instances = []
    
    for lesson in lessons:
        all_text = f"{lesson['card_concept']} {lesson['card_example']} {lesson['card_mistake']} {lesson['card_science']} {lesson['card_challenge']}"
        
        for pattern in gendered_terms:
            matches = re.finditer(pattern, all_text, re.IGNORECASE)
            for match in matches:
                instances.append({
                    'lesson_title': lesson['title'],
                    'term': match.group(),
                    'context': all_text[max(0, match.start()-50):match.end()+50]
                })
    
    return instances

def check_ability_assumptions(lessons):
    """Check for assumptions about physical/mental ability"""
    ability_terms = [
        r'\bjust stand\b',
        r'\bjust walk\b',
        r'\bjust run\b',
        r'\beveryone can\b',
        r'\banyone can\b',
        r'\bsimply\b',
        r'\beasily\b'
    ]
    
    instances = []
    
    for lesson in lessons:
        all_text = f"{lesson['card_concept']} {lesson['card_example']} {lesson['card_challenge']}"
        
        for pattern in ability_terms:
            matches = re.finditer(pattern, all_text, re.IGNORECASE)
            for match in matches:
                # Check if it's in a context that assumes universal ability
                context = all_text[max(0, match.start()-100):match.end()+100]
                if not any(modifier in context.lower() for modifier in ['if you can', 'when able', 'if possible']):
                    instances.append({
                        'lesson_title': lesson['title'],
                        'term': match.group(),
                        'context': context
                    })
    
    return instances

def analyze_positive_fitness_language(lessons):
    """Identify positive performance-focused language in Fitness content"""
    positive_terms = [
        r'\bstronger\b',
        r'\bperformance\b',
        r'\bcapability\b',
        r'\bfeel better\b',
        r'\bhealth\b',
        r'\benergy\b',
        r'\bconfidence\b',
        r'\bendurance\b',
        r'\bmobility\b',
        r'\bfunction\b'
    ]
    
    fitness_lessons = [l for l in lessons if l['id'].startswith('33333333-0200')]
    positive_count = 0
    
    for lesson in fitness_lessons:
        all_text = f"{lesson['card_concept']} {lesson['card_example']} {lesson['card_challenge']}"
        for pattern in positive_terms:
            positive_count += len(re.findall(pattern, all_text, re.IGNORECASE))
    
    return {
        'fitness_lessons': len(fitness_lessons),
        'positive_term_instances': positive_count,
        'average_per_lesson': round(positive_count / len(fitness_lessons), 2) if fitness_lessons else 0
    }

def main():
    print("=" * 80)
    print("INCLUSIVITY & SENSITIVITY ANALYSIS")
    print("Lesson Content Enhancement Spec - Task 4.4")
    print("=" * 80)
    print()
    
    # Read SQL file
    with open('ascevo/supabase/lessons_all_pillars.sql', 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    print("📚 Extracting lessons from SQL file...")
    lessons = extract_lessons(sql_content)
    print(f"   Found {len(lessons)} lessons")
    print()
    
    # 1. Name and Demographic Diversity
    print("=" * 80)
    print("1. CHARACTER DIVERSITY ANALYSIS")
    print("=" * 80)
    print()
    
    characters = extract_names_and_demographics(lessons)
    name_analysis = analyze_name_diversity(characters)
    
    print(f"Total Characters: {name_analysis['total_characters']}")
    print(f"Unique Names: {name_analysis['unique_names']}")
    print(f"Diversity Breakdown:")
    print(f"  - European/Common names: {name_analysis['european_common']} ({name_analysis['european_common']/name_analysis['total_characters']*100:.1f}%)")
    print(f"  - Global/Diverse names: {name_analysis['global_diverse']} ({name_analysis['global_diverse']/name_analysis['total_characters']*100:.1f}%)")
    print(f"  - Other names: {name_analysis['other']}")
    print(f"\n✅ Diversity Score: {name_analysis['diversity_percentage']}% globally diverse names")
    print()
    
    print("Most Common Names:")
    for name, count in sorted(name_analysis['all_names'].items(), key=lambda x: x[1], reverse=True)[:15]:
        print(f"  - {name}: {count}")
    print()
    
    # 2. Age Distribution
    print("=" * 80)
    print("2. AGE DIVERSITY ANALYSIS")
    print("=" * 80)
    print()
    
    age_analysis = analyze_age_distribution(characters)
    print(f"Age Range: {age_analysis['age_range']}")
    print(f"Average Age: {age_analysis['average_age']}")
    print(f"\nAge Distribution:")
    for age, count in sorted(age_analysis['age_distribution'].items()):
        print(f"  - Age {age}: {count} characters")
    print()
    
    # 3. Context Diversity
    print("=" * 80)
    print("3. CONTEXT & BACKGROUND DIVERSITY")
    print("=" * 80)
    print()
    
    context_analysis = analyze_context_diversity(characters)
    print(f"Context Distribution:")
    print(f"  - Academic: {context_analysis['academic']}")
    print(f"  - Work/Career: {context_analysis['work']}")
    print(f"  - Personal/Relationships: {context_analysis['personal']}")
    print(f"  - Fitness: {context_analysis['fitness']}")
    print(f"  - Other: {context_analysis['other']}")
    print()
    
    # 4. Body Image Language
    print("=" * 80)
    print("4. BODY IMAGE LANGUAGE REVIEW (FITNESS FOCUS)")
    print("=" * 80)
    print()
    
    body_image_issues = check_body_image_language(lessons)
    
    if body_image_issues:
        print(f"⚠️  Found {len(body_image_issues)} potential body image language issues:")
        print()
        fitness_issues = [i for i in body_image_issues if i['is_fitness']]
        non_fitness_issues = [i for i in body_image_issues if not i['is_fitness']]
        
        if fitness_issues:
            print(f"In Fitness Pillar ({len(fitness_issues)} issues):")
            for issue in fitness_issues[:10]:  # Show first 10
                print(f"  - Lesson: '{issue['lesson_title']}'")
                print(f"    Term: '{issue['term']}'")
                print(f"    Context: ...{issue['context']}...")
                print()
        
        if non_fitness_issues:
            print(f"In Other Pillars ({len(non_fitness_issues)} issues):")
            for issue in non_fitness_issues[:10]:
                print(f"  - Lesson: '{issue['lesson_title']}'")
                print(f"    Term: '{issue['term']}'")
                print(f"    Context: ...{issue['context']}...")
                print()
    else:
        print("✅ No problematic body image language detected")
        print()
    
    # Positive fitness language
    positive_analysis = analyze_positive_fitness_language(lessons)
    print(f"Positive Performance-Focused Language in Fitness:")
    print(f"  - Total fitness lessons: {positive_analysis['fitness_lessons']}")
    print(f"  - Positive terms found: {positive_analysis['positive_term_instances']}")
    print(f"  - Average per lesson: {positive_analysis['average_per_lesson']}")
    print()
    
    # 5. Gender Assumptions
    print("=" * 80)
    print("5. GENDER & SEXUALITY ASSUMPTIONS")
    print("=" * 80)
    print()
    
    gender_instances = check_gender_assumptions(lessons)
    
    if gender_instances:
        print(f"Found {len(gender_instances)} instances of gendered language:")
        print("(Review needed to ensure inclusive framing)")
        print()
        for instance in gender_instances[:15]:
            print(f"  - Lesson: '{instance['lesson_title']}'")
            print(f"    Term: '{instance['term']}'")
            print(f"    Context: ...{instance['context']}...")
            print()
    else:
        print("✅ No gendered language detected")
        print()
    
    # 6. Ability Assumptions
    print("=" * 80)
    print("6. ABILITY ASSUMPTIONS")
    print("=" * 80)
    print()
    
    ability_instances = check_ability_assumptions(lessons)
    
    if ability_instances:
        print(f"⚠️  Found {len(ability_instances)} potential ability assumptions:")
        print()
        for instance in ability_instances[:15]:
            print(f"  - Lesson: '{instance['lesson_title']}'")
            print(f"    Term: '{instance['term']}'")
            print(f"    Context: ...{instance['context']}...")
            print()
    else:
        print("✅ No problematic ability assumptions detected")
        print()
    
    # Summary
    print("=" * 80)
    print("SUMMARY & RECOMMENDATIONS")
    print("=" * 80)
    print()
    
    print("✅ STRENGTHS:")
    if name_analysis['diversity_percentage'] > 30:
        print(f"  • Good name diversity ({name_analysis['diversity_percentage']}% globally diverse)")
    if not body_image_issues or len([i for i in body_image_issues if i['is_fitness']]) == 0:
        print("  • Fitness content avoids harmful body image language")
    if positive_analysis['average_per_lesson'] > 2:
        print(f"  • Strong performance-focused language in Fitness ({positive_analysis['average_per_lesson']} positive terms per lesson)")
    
    print()
    print("⚠️  AREAS FOR REVIEW:")
    if name_analysis['european_common'] > name_analysis['global_diverse']:
        print("  • Consider increasing diversity of character names")
    if body_image_issues:
        print(f"  • Review {len(body_image_issues)} instances of body image language")
    if gender_instances:
        print(f"  • Review {len(gender_instances)} instances of gendered language for inclusive framing")
    if ability_instances:
        print(f"  • Review {len(ability_instances)} instances that may assume universal ability")
    
    print()
    print("=" * 80)
    
    # Write detailed report to JSON
    report = {
        'total_lessons': len(lessons),
        'character_diversity': name_analysis,
        'age_distribution': age_analysis,
        'context_diversity': context_analysis,
        'body_image_issues': body_image_issues,
        'gender_instances': gender_instances,
        'ability_instances': ability_instances,
        'positive_fitness_language': positive_analysis
    }
    
    with open('inclusivity_review_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print("\n📄 Detailed report saved to: inclusivity_review_report.json")

if __name__ == '__main__':
    main()
