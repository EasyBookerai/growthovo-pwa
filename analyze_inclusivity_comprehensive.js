#!/usr/bin/env node
/**
 * Comprehensive Inclusivity & Sensitivity Analysis
 * Analyzes lesson content for:
 * 1. Diversity in character names and representation
 * 2. Harmful body image language (especially in Fitness)
 * 3. Context and background diversity
 * 4. Assumptions about gender, sexuality, ability
 */

const fs = require('fs');

function extractLessons(sqlContent) {
    const lessons = [];
    
    // Split by INSERT INTO lessons statements to handle multiple inserts
    const insertSections = sqlContent.split(/INSERT INTO lessons[^V]*VALUES/);
    
    for (let i = 1; i < insertSections.length; i++) {
        const section = insertSections[i];
        
        // Extract individual lesson rows - they start with ( and end with ), or );
        const rowPattern = /\(('.*?'(?:,\s*'.*?')*)\)(?:,|\s*;)/gs;
        let match;
        
        while ((match = rowPattern.exec(section)) !== null) {
            const values = match[1];
            // Extract quoted strings (handling escaped quotes)
            const cards = [];
            const quotePattern = /'((?:[^']|'')*?)'/g;
            let quoteMatch;
            while ((quoteMatch = quotePattern.exec(values)) !== null) {
                cards.push(quoteMatch[1].replace(/''/g, "'"));
            }
            
            if (cards.length >= 6) {
                lessons.push({
                    id: cards[0] || '',
                    unit_id: cards[1] || '',
                    title: cards[2] || '',
                    card_concept: cards[4] || '',
                    card_example: cards[5] || '',
                    card_mistake: cards[6] || '',
                    card_science: cards[7] || '',
                    card_challenge: cards[8] || ''
                });
            }
        }
    }
    
    return lessons;
}

function extractNamesAndDemographics(lessons) {
    const pattern = /([A-Z][a-z]+),\s*(\d{1,2}),\s*([^.]+)/g;
    const characters = [];
    
    for (const lesson of lessons) {
        const example = lesson.card_example;
        let match;
        while ((match = pattern.exec(example)) !== null) {
            characters.push({
                name: match[1],
                age: parseInt(match[2]),
                context: match[3].trim(),
                lesson_title: lesson.title,
                full_example: example
            });
        }
    }
    
    return characters;
}

function analyzeNameDiversity(characters) {
    const names = characters.map(c => c.name);
    const nameCounts = {};
    names.forEach(n => nameCounts[n] = (nameCounts[n] || 0) + 1);
    
    // Categorize names
    const europeanCommon = ['John', 'James', 'Sarah', 'Emma', 'Tom', 'Jake', 'Ryan', 'Noah', 'Daniel', 'Ella', 'Grace', 'Leo', 'Mia', 'Chloe', 'Ava', 'Oliver', 'Charlotte', 'Lily', 'Sophie', 'Ben'];
    const globalDiverse = ['Lena', 'Marcus', 'Aisha', 'Sofia', 'Zara', 'Kai', 'Priya', 'Yuki', 'Jamal', 'Fatima', 'Raj', 'Amara', 'Chen', 'Diego', 'Mei', 'Hassan', 'Camila', 'Kofi', 'Nia', 'Tariq'];
    
    const europeanCount = names.filter(n => europeanCommon.includes(n)).length;
    const diverseCount = names.filter(n => globalDiverse.includes(n)).length;
    const otherCount = names.length - europeanCount - diverseCount;
    
    return {
        total_characters: characters.length,
        unique_names: Object.keys(nameCounts).length,
        european_common: europeanCount,
        global_diverse: diverseCount,
        other: otherCount,
        all_names: nameCounts,
        diversity_percentage: names.length > 0 ? ((diverseCount / names.length) * 100).toFixed(2) : 0
    };
}

function analyzeAgeDistribution(characters) {
    const ages = characters.map(c => c.age);
    const ageCounts = {};
    ages.forEach(a => ageCounts[a] = (ageCounts[a] || 0) + 1);
    
    return {
        age_range: ages.length > 0 ? `${Math.min(...ages)}-${Math.max(...ages)}` : "N/A",
        average_age: ages.length > 0 ? (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1) : 0,
        age_distribution: ageCounts
    };
}

function analyzeContextDiversity(characters) {
    const contexts = characters.map(c => c.context.toLowerCase());
    
    const academic = contexts.filter(c => 
        ['university', 'class', 'seminar', 'student', 'professor', 'presentation', 'course'].some(word => c.includes(word))
    ).length;
    
    const work = contexts.filter(c => 
        ['job', 'work', 'manager', 'interview', 'startup', 'team', 'career', 'colleague'].some(word => c.includes(word))
    ).length;
    
    const personal = contexts.filter(c => 
        ['friend', 'relationship', 'family', 'dating', 'partner', 'parent'].some(word => c.includes(word))
    ).length;
    
    const fitness = contexts.filter(c => 
        ['gym', 'workout', 'exercise', 'running', 'fitness', 'training'].some(word => c.includes(word))
    ).length;
    
    return {
        academic,
        work,
        personal,
        fitness,
        other: contexts.length - academic - work - personal - fitness
    };
}

function checkBodyImageLanguage(lessons) {
    const problematicTerms = [
        /\bfat\b(?! loss metabolism|ty acid)/i,
        /\bobese\b/i,
        /\boverweight\b/i,
        /\bskinny\b/i,
        /\bthin\b(?! air|king)/i,
        /\blook better\b/i,
        /\blook good\b/i,
        /\bbeach body\b/i,
        /\bsummer body\b/i,
        /\bperfect body\b/i,
        /\bideal body\b/i,
        /\bbody goals\b/i,
        /\bweight loss\b/i,
        /\blose weight\b/i,
        /\bburn fat\b/i,
        /\bget ripped\b/i,
        /\bget shredded\b/i,
        /\bflat stomach\b/i,
        /\bsix pack\b/i,
        /\btoned\b/i,
        /\bcheat meal\b/i,
        /\bcheat day\b/i
    ];
    
    const issues = [];
    
    for (const lesson of lessons) {
        const isFitness = lesson.id.startsWith('33333333-0200');
        const allText = `${lesson.card_concept} ${lesson.card_example} ${lesson.card_mistake} ${lesson.card_science} ${lesson.card_challenge}`;
        
        for (const pattern of problematicTerms) {
            const matches = allText.matchAll(new RegExp(pattern.source, 'gi'));
            for (const match of matches) {
                const start = Math.max(0, match.index - 50);
                const end = match.index + match[0].length + 50;
                issues.push({
                    lesson_title: lesson.title,
                    is_fitness: isFitness,
                    term: match[0],
                    context: allText.substring(start, end)
                });
            }
        }
    }
    
    return issues;
}

function checkGenderAssumptions(lessons) {
    const genderedTerms = [
        /\bboyfriend\b/i,
        /\bgirlfriend\b/i,
        /\bhusband\b/i,
        /\bwife\b/i,
        /\bhe or she\b/i,
        /\bhis or her\b/i,
        /\bmen and women\b/i,
        /\bguy\b/i,
        /\bgirl\b/i
    ];
    
    const instances = [];
    
    for (const lesson of lessons) {
        const allText = `${lesson.card_concept} ${lesson.card_example} ${lesson.card_mistake} ${lesson.card_science} ${lesson.card_challenge}`;
        
        for (const pattern of genderedTerms) {
            const matches = allText.matchAll(new RegExp(pattern.source, 'gi'));
            for (const match of matches) {
                const start = Math.max(0, match.index - 50);
                const end = match.index + match[0].length + 50;
                instances.push({
                    lesson_title: lesson.title,
                    term: match[0],
                    context: allText.substring(start, end)
                });
            }
        }
    }
    
    return instances;
}

function checkAbilityAssumptions(lessons) {
    const abilityTerms = [
        /\bjust stand\b/i,
        /\bjust walk\b/i,
        /\bjust run\b/i,
        /\beveryone can\b/i,
        /\banyone can\b/i
    ];
    
    const instances = [];
    
    for (const lesson of lessons) {
        const allText = `${lesson.card_concept} ${lesson.card_example} ${lesson.card_challenge}`;
        
        for (const pattern of abilityTerms) {
            const matches = allText.matchAll(new RegExp(pattern.source, 'gi'));
            for (const match of matches) {
                const start = Math.max(0, match.index - 100);
                const end = match.index + match[0].length + 100;
                const context = allText.substring(start, end);
                
                // Check if there are modifiers
                if (!['if you can', 'when able', 'if possible'].some(mod => context.toLowerCase().includes(mod))) {
                    instances.push({
                        lesson_title: lesson.title,
                        term: match[0],
                        context
                    });
                }
            }
        }
    }
    
    return instances;
}

function analyzePositiveFitnessLanguage(lessons) {
    const positiveTerms = [
        /\bstronger\b/gi,
        /\bperformance\b/gi,
        /\bcapability\b/gi,
        /\bfeel better\b/gi,
        /\bhealth\b/gi,
        /\benergy\b/gi,
        /\bconfidence\b/gi,
        /\bendurance\b/gi,
        /\bmobility\b/gi,
        /\bfunction\b/gi
    ];
    
    const fitnessLessons = lessons.filter(l => l.id.startsWith('33333333-0200'));
    let positiveCount = 0;
    
    for (const lesson of fitnessLessons) {
        const allText = `${lesson.card_concept} ${lesson.card_example} ${lesson.card_challenge}`;
        for (const pattern of positiveTerms) {
            const matches = allText.match(pattern);
            if (matches) positiveCount += matches.length;
        }
    }
    
    return {
        fitness_lessons: fitnessLessons.length,
        positive_term_instances: positiveCount,
        average_per_lesson: fitnessLessons.length > 0 ? (positiveCount / fitnessLessons.length).toFixed(2) : 0
    };
}

function main() {
    console.log("=".repeat(80));
    console.log("INCLUSIVITY & SENSITIVITY ANALYSIS");
    console.log("Lesson Content Enhancement Spec - Task 4.4");
    console.log("=".repeat(80));
    console.log();
    
    // Read SQL file
    const sqlContent = fs.readFileSync('ascevo/supabase/lessons_all_pillars.sql', 'utf-8');
    
    console.log("📚 Extracting lessons from SQL file...");
    const lessons = extractLessons(sqlContent);
    console.log(`   Found ${lessons.length} lessons`);
    console.log();
    
    // 1. Name and Demographic Diversity
    console.log("=".repeat(80));
    console.log("1. CHARACTER DIVERSITY ANALYSIS");
    console.log("=".repeat(80));
    console.log();
    
    const characters = extractNamesAndDemographics(lessons);
    const nameAnalysis = analyzeNameDiversity(characters);
    
    console.log(`Total Characters: ${nameAnalysis.total_characters}`);
    console.log(`Unique Names: ${nameAnalysis.unique_names}`);
    console.log(`Diversity Breakdown:`);
    console.log(`  - European/Common names: ${nameAnalysis.european_common} (${(nameAnalysis.european_common/nameAnalysis.total_characters*100).toFixed(1)}%)`);
    console.log(`  - Global/Diverse names: ${nameAnalysis.global_diverse} (${(nameAnalysis.global_diverse/nameAnalysis.total_characters*100).toFixed(1)}%)`);
    console.log(`  - Other names: ${nameAnalysis.other}`);
    console.log(`\n✅ Diversity Score: ${nameAnalysis.diversity_percentage}% globally diverse names`);
    console.log();
    
    console.log("Most Common Names:");
    Object.entries(nameAnalysis.all_names)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .forEach(([name, count]) => console.log(`  - ${name}: ${count}`));
    console.log();
    
    // 2. Age Distribution
    console.log("=".repeat(80));
    console.log("2. AGE DIVERSITY ANALYSIS");
    console.log("=".repeat(80));
    console.log();
    
    const ageAnalysis = analyzeAgeDistribution(characters);
    console.log(`Age Range: ${ageAnalysis.age_range}`);
    console.log(`Average Age: ${ageAnalysis.average_age}`);
    console.log(`\nAge Distribution:`);
    Object.entries(ageAnalysis.age_distribution)
        .sort((a, b) => a[0] - b[0])
        .forEach(([age, count]) => console.log(`  - Age ${age}: ${count} characters`));
    console.log();
    
    // 3. Context Diversity
    console.log("=".repeat(80));
    console.log("3. CONTEXT & BACKGROUND DIVERSITY");
    console.log("=".repeat(80));
    console.log();
    
    const contextAnalysis = analyzeContextDiversity(characters);
    console.log(`Context Distribution:`);
    console.log(`  - Academic: ${contextAnalysis.academic}`);
    console.log(`  - Work/Career: ${contextAnalysis.work}`);
    console.log(`  - Personal/Relationships: ${contextAnalysis.personal}`);
    console.log(`  - Fitness: ${contextAnalysis.fitness}`);
    console.log(`  - Other: ${contextAnalysis.other}`);
    console.log();
    
    // 4. Body Image Language
    console.log("=".repeat(80));
    console.log("4. BODY IMAGE LANGUAGE REVIEW (FITNESS FOCUS)");
    console.log("=".repeat(80));
    console.log();
    
    const bodyImageIssues = checkBodyImageLanguage(lessons);
    
    if (bodyImageIssues.length > 0) {
        console.log(`⚠️  Found ${bodyImageIssues.length} potential body image language issues:`);
        console.log();
        
        const fitnessIssues = bodyImageIssues.filter(i => i.is_fitness);
        const nonFitnessIssues = bodyImageIssues.filter(i => !i.is_fitness);
        
        if (fitnessIssues.length > 0) {
            console.log(`In Fitness Pillar (${fitnessIssues.length} issues):`);
            fitnessIssues.slice(0, 10).forEach(issue => {
                console.log(`  - Lesson: '${issue.lesson_title}'`);
                console.log(`    Term: '${issue.term}'`);
                console.log(`    Context: ...${issue.context}...`);
                console.log();
            });
        }
        
        if (nonFitnessIssues.length > 0) {
            console.log(`In Other Pillars (${nonFitnessIssues.length} issues):`);
            nonFitnessIssues.slice(0, 10).forEach(issue => {
                console.log(`  - Lesson: '${issue.lesson_title}'`);
                console.log(`    Term: '${issue.term}'`);
                console.log(`    Context: ...${issue.context}...`);
                console.log();
            });
        }
    } else {
        console.log("✅ No problematic body image language detected");
        console.log();
    }
    
    // Positive fitness language
    const positiveAnalysis = analyzePositiveFitnessLanguage(lessons);
    console.log(`Positive Performance-Focused Language in Fitness:`);
    console.log(`  - Total fitness lessons: ${positiveAnalysis.fitness_lessons}`);
    console.log(`  - Positive terms found: ${positiveAnalysis.positive_term_instances}`);
    console.log(`  - Average per lesson: ${positiveAnalysis.average_per_lesson}`);
    console.log();
    
    // 5. Gender Assumptions
    console.log("=".repeat(80));
    console.log("5. GENDER & SEXUALITY ASSUMPTIONS");
    console.log("=".repeat(80));
    console.log();
    
    const genderInstances = checkGenderAssumptions(lessons);
    
    if (genderInstances.length > 0) {
        console.log(`Found ${genderInstances.length} instances of gendered language:`);
        console.log("(Review needed to ensure inclusive framing)");
        console.log();
        genderInstances.slice(0, 15).forEach(instance => {
            console.log(`  - Lesson: '${instance.lesson_title}'`);
            console.log(`    Term: '${instance.term}'`);
            console.log(`    Context: ...${instance.context}...`);
            console.log();
        });
    } else {
        console.log("✅ No gendered language detected");
        console.log();
    }
    
    // 6. Ability Assumptions
    console.log("=".repeat(80));
    console.log("6. ABILITY ASSUMPTIONS");
    console.log("=".repeat(80));
    console.log();
    
    const abilityInstances = checkAbilityAssumptions(lessons);
    
    if (abilityInstances.length > 0) {
        console.log(`⚠️  Found ${abilityInstances.length} potential ability assumptions:`);
        console.log();
        abilityInstances.slice(0, 15).forEach(instance => {
            console.log(`  - Lesson: '${instance.lesson_title}'`);
            console.log(`    Term: '${instance.term}'`);
            console.log(`    Context: ...${instance.context}...`);
            console.log();
        });
    } else {
        console.log("✅ No problematic ability assumptions detected");
        console.log();
    }
    
    // Summary
    console.log("=".repeat(80));
    console.log("SUMMARY & RECOMMENDATIONS");
    console.log("=".repeat(80));
    console.log();
    
    console.log("✅ STRENGTHS:");
    if (nameAnalysis.diversity_percentage > 30) {
        console.log(`  • Good name diversity (${nameAnalysis.diversity_percentage}% globally diverse)`);
    }
    if (bodyImageIssues.filter(i => i.is_fitness).length === 0) {
        console.log("  • Fitness content avoids harmful body image language");
    }
    if (positiveAnalysis.average_per_lesson > 2) {
        console.log(`  • Strong performance-focused language in Fitness (${positiveAnalysis.average_per_lesson} positive terms per lesson)`);
    }
    if (contextAnalysis.academic > 0 && contextAnalysis.work > 0 && contextAnalysis.personal > 0) {
        console.log("  • Examples span multiple contexts (academic, work, personal)");
    }
    
    console.log();
    console.log("⚠️  AREAS FOR REVIEW:");
    if (nameAnalysis.european_common > nameAnalysis.global_diverse) {
        console.log("  • Consider increasing diversity of character names");
    }
    if (bodyImageIssues.length > 0) {
        console.log(`  • Review ${bodyImageIssues.length} instances of body image language`);
    }
    if (genderInstances.length > 0) {
        console.log(`  • Review ${genderInstances.length} instances of gendered language for inclusive framing`);
    }
    if (abilityInstances.length > 0) {
        console.log(`  • Review ${abilityInstances.length} instances that may assume universal ability`);
    }
    
    console.log();
    console.log("=".repeat(80));
    
    // Write detailed report to JSON
    const report = {
        total_lessons: lessons.length,
        character_diversity: nameAnalysis,
        age_distribution: ageAnalysis,
        context_diversity: contextAnalysis,
        body_image_issues: bodyImageIssues,
        gender_instances: genderInstances,
        ability_instances: abilityInstances,
        positive_fitness_language: positiveAnalysis
    };
    
    fs.writeFileSync('inclusivity_review_report.json', JSON.stringify(report, null, 2));
    
    console.log("\n📄 Detailed report saved to: inclusivity_review_report.json");
}

main();
