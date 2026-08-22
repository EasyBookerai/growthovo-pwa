# PowerShell script to convert FITNESS_LESSONS_COMPLETE.md to SQL

$content = Get-Content ".kiro/specs/lesson-content-enhancement/FITNESS_LESSONS_COMPLETE.md" -Raw

# Function to escape SQL quotes
function Escape-SQL {
    param($text)
    return $text.Replace("'", "''")
}

# Initialize output
$output = @"
-- ============================================================
-- FITNESS PILLAR (Pillar 02) - All 40 Lessons  
-- ============================================================
-- Generated from FITNESS_LESSONS_COMPLETE.md
-- UUID Scheme:
--   Units:   22222222-0200-00UU-0000-000000000000 (UU = 01-05)
--   Lessons: 33333333-0200-00UU-0000-00000000000L (UU = unit, L = lesson 1-8)
--
-- Pillar ID: 11111111-0000-0000-0000-000000000002 (Fitness)
--

-- ============================================================
-- FITNESS UNITS
-- ============================================================
INSERT INTO units (id, pillar_id, title, display_order) VALUES
  ('22222222-0200-0001-0000-000000000000', '11111111-0000-0000-0000-000000000002', 'Movement Foundations', 1),
  ('22222222-0200-0002-0000-000000000000', '11111111-0000-0000-0000-000000000002', 'Strength Building', 2),
  ('22222222-0200-0003-0000-000000000000', '11111111-0000-0000-0000-000000000002', 'Cardio & Endurance', 3),
  ('22222222-0200-0004-0000-000000000000', '11111111-0000-0000-0000-000000000002', 'Nutrition Basics', 4),
  ('22222222-0200-0005-0000-000000000000', '11111111-0000-0000-0000-000000000002', 'Recovery & Longevity', 5);

"@

# Split by lesson headers
$lessonPattern = '### Lesson (\d+): ([^\n]+)'
$lessons = [regex]::Matches($content, "(?s)(### Lesson \d+:.*?)(?=### Lesson \d+:|$)")

$lessonData = @()

foreach ($match in $lessons) {
    $lessonText = $match.Value
    
    # Extract lesson number and title
    if ($lessonText -match '### Lesson (\d+): ([^\n]+)') {
        $globalNum = [int]$matches[1]
        $title = $matches[2].Trim()
        
        # Calculate unit and local lesson number
        $unitNum = [Math]::Ceiling($globalNum / 8.0)
        $localNum = (($globalNum - 1) % 8) + 1
        
        # Extract cards
        $concept = ""
        $example = ""
        $mistake = ""
        $science = ""
        $challenge = ""
        
        if ($lessonText -match '\*\*Concept:\*\*\s+(.*?)(?=\*\*Example:\*\*)') {
            $concept = $matches[1].Trim()
        }
        if ($lessonText -match '\*\*Example:\*\*\s+(.*?)(?=\*\*Mistake:\*\*)') {
            $example = $matches[1].Trim()
        }
        if ($lessonText -match '\*\*Mistake:\*\*\s+(.*?)(?=\*\*Science:\*\*)') {
            $mistake = $matches[1].Trim()
        }
        if ($lessonText -match '\*\*Science:\*\*\s+(.*?)(?=\*\*Challenge:\*\*)') {
            $science = $matches[1].Trim()
        }
        if ($lessonText -match '\*\*Challenge:\*\*\s+(.*?)(?=---|$)') {
            $challenge = $matches[1].Trim()
        }
        
        $lessonData += @{
            GlobalNum = $globalNum
            UnitNum = $unitNum
            LocalNum = $localNum
            Title = $title
            Concept = $concept
            Example = $example
            Mistake = $mistake
            Science = $science
            Challenge = $challenge
        }
    }
}

Write-Host "Found $($lessonData.Count) lessons"

# Group by unit and generate SQL
for ($unit = 1; $unit -le 5; $unit++) {
    $unitLessons = $lessonData | Where-Object { $_.UnitNum -eq $unit } | Sort-Object LocalNum
    
    if ($unitLessons.Count -gt 0) {
        $unitNames = @{
            1 = "Movement Foundations"
            2 = "Strength Building"
            3 = "Cardio & Endurance"
            4 = "Nutrition Basics"
            5 = "Recovery & Longevity"
        }
        
        $output += @"
-- ============================================================
-- FITNESS — Unit $unit: $($unitNames[$unit])
-- ============================================================
INSERT INTO lessons (id, unit_id, title, display_order, card_concept, card_example, card_mistake, card_science, card_challenge) VALUES

"@
        
        $inserts = @()
        foreach ($lesson in $unitLessons) {
            $lessonId = "33333333-0200-00{0:D2}-0000-00000000000{1}" -f $unit, $lesson.LocalNum
            $unitId = "22222222-0200-00{0:D2}-0000-000000000000" -f $unit
            
            $title = Escape-SQL $lesson.Title
            $concept = Escape-SQL $lesson.Concept
            $example = Escape-SQL $lesson.Example
            $mistake = Escape-SQL $lesson.Mistake
            $science = Escape-SQL $lesson.Science
            $challenge = Escape-SQL $lesson.Challenge
            
            $insert = "('$lessonId','$unitId','$title',$($lesson.LocalNum),`n'$concept',`n'$example',`n'$mistake',`n'$science',`n'$challenge')"
            $inserts += $insert
        }
        
        $output += ($inserts -join ",`n`n") + ";`n`n"
    }
}

# Write to file
$output | Out-File -FilePath ".kiro/specs/lesson-content-enhancement/fitness_pillar.sql" -Encoding UTF8

Write-Host "✅ Generated fitness_pillar.sql with $($lessonData.Count) lessons"
