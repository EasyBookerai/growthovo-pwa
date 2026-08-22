#!/usr/bin/env python3
"""
Analyze lesson content for inclusivity and sensitivity issues.
"""
import re
from collections import Counter
from pathlib import Path

def extract_names_from_sql(filepath):
    """Extract all character names and ages from SQL file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern: 'Name, age, ...
    pattern = r"'([A-Z][a-z]+), (\d{2}),"
    matches = re.findall(pattern, content)
    
    return [(name, int(age)) for name, age in matches]

def analyze_name_diversity(names):
    """Analyze diversity of names used."""
    name_list = [name for name, _ in names]
    name_counts = Counter(name_list)
    
    # Categorize names by origin (simplified)
    european_names = ['Lena', 'Marcus', 'Jake', 'Sofia', 'Aisha', 'Ryan', 'Priya', 'Ella', 
                      'Noah', 'Chloe', 'James', 'Mia', 'Ava', 'Leo', 'Grace', 'Daniel',
                      'Tom', 'Zara', 'Kai', 'Lily', 'Liam', 'Elena', 'Sophia', 'Mia',
                      'Anya', 'Luca', 'Ethan']
    
    south_asian = ['Aisha', 'Priya', 'Kai']
    arabic_middle_eastern = ['Aisha']
    east_asian = ['Kai']
    african = ['Zara']
    latin_american = ['Sofia', 'Elena', 'Lily', 'Luca']
    
    print(f"\n{'='*60}")
    print("NAME DIVERSITY ANALYSIS")
    print(f"{'='*60}")
    print(f"\nTotal unique names: {len(name_counts)}")
    print(f"Total name uses: {sum(name_counts.values())}")
    print(f"\nMost common names:")
    for name, count in name_counts.most_common(10):
        print(f"  {name}: {count} times")
    
    return name_counts

def search_body_image_language(filepath):
    """Search for potentially harmful body image language."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Problematic phrases to flag
    red_flags = [
        r'lose weight',
        r'get skinny',
        r'burn fat',
        r'beach body',
        r'summer body',
        r'six pack',
        r'shredded',
        r'ripped',
        r'toned',
        r'slim down',
        r'diet\b',
        r'calories.*restrict',
        r'cheat\s+(day|meal)',
        r'guilty.*eat',
        r'bad food',
        r'good food'
    ]
    
    findings = []
    for pattern in red_flags:
        matches = re.finditer(pattern, content, re.IGNORECASE)
        for match in matches:
            start = max(0, match.start() - 100)
            end = min(len(content), match.end() + 100)
            context = content[start:end].replace('\n', ' ')
            findings.append((pattern, context))
    
    return findings

def search_assumption_language(filepath):
    """Search for language that makes assumptions about gender, sexuality, ability."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Patterns that might indicate assumptions
    check_patterns = [
        r'his girlfriend|her boyfriend',
        r'his wife|her husband',
        r'normal\s+people',
        r'everyone can',
        r'just\s+\w+',  # "just run", "just lift" - minimizes difficulty
        r'simply\s+\w+',
    ]
    
    findings = []
    for pattern in check_patterns:
        matches = re.finditer(pattern, content, re.IGNORECASE)
        for match in matches:
            start = max(0, match.start() - 100)
            end = min(len(content), match.end() + 100)
            context = content[start:end].replace('\n', ' ')
            findings.append((pattern, context))
    
    return findings

def main():
    print("INCLUSIVITY & SENSITIVITY REVIEW")
    print("=" * 60)
    
    # Analyze main lessons file
    main_sql = Path("ascevo/supabase/lessons_all_pillars.sql")
    fitness_sql = Path(".kiro/specs/lesson-content-enhancement/fitness_pillar.sql")
    
    all_names = []
    
    if main_sql.exists():
        print(f"\nAnalyzing {main_sql}...")
        names = extract_names_from_sql(main_sql)
        all_names.extend(names)
        print(f"Found {len(names)} character examples")
    
    if fitness_sql.exists():
        print(f"\nAnalyzing {fitness_sql}...")
        names = extract_names_from_sql(fitness_sql)
        all_names.extend(names)
        print(f"Found {len(names)} character examples")
    
    # Analyze name diversity
    analyze_name_diversity(all_names)
    
    # Check age distribution
    ages = [age for _, age in all_names]
    print(f"\n{'='*60}")
    print("AGE DISTRIBUTION")
    print(f"{'='*60}")
    print(f"Age range: {min(ages)} - {max(ages)}")
    print(f"Average age: {sum(ages) / len(ages):.1f}")
    age_counts = Counter(ages)
    print(f"\nAge frequency:")
    for age in sorted(age_counts.keys()):
        print(f"  {age}: {'*' * age_counts[age]}")
    
    # Body image language check (Fitness pillar)
    if fitness_sql.exists():
        print(f"\n{'='*60}")
        print("BODY IMAGE LANGUAGE CHECK (Fitness Pillar)")
        print(f"{'='*60}")
        findings = search_body_image_language(fitness_sql)
        if findings:
            print(f"\n⚠️  Found {len(findings)} potential concerns:")
            for pattern, context in findings[:5]:  # Show first 5
                print(f"\nPattern: {pattern}")
                print(f"Context: ...{context}...")
        else:
            print("\n✓ No problematic body image language detected")
    
    # Assumption language check
    print(f"\n{'='*60}")
    print("ASSUMPTION LANGUAGE CHECK")
    print(f"{'='*60}")
    
    for filepath in [main_sql, fitness_sql]:
        if filepath.exists():
            findings = search_assumption_language(filepath)
            if findings:
                print(f"\n{filepath.name}:")
                print(f"  Found {len(findings)} patterns to review")
            else:
                print(f"\n{filepath.name}: ✓ No concerning patterns")

if __name__ == "__main__":
    main()
