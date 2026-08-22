# Read SQL file
$sqlContent = Get-Content 'ascevo/supabase/lessons_all_pillars.sql' -Raw

# Find all lessons by matching the full tuple pattern
# Each lesson is ('uuid','uuid','title',N,'card1','card2','card3','card4','card5')
# Where card5 is the challenge card

$pattern = "\('([0-9a-f-]+)','([0-9a-f-]+)','([^']+)',\d+,\s*'((?:[^']|'')+)',\s*'((?:[^']|'')+)',\s*'((?:[^']|'')+)',\s*'((?:[^']|'')+)',\s*'((?:[^']|'')+)'\)"

$matches = [regex]::Matches($sqlContent, $pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)

Write-Host "Found $($matches.Count) lessons"

$lessons = @()

foreach ($match in $matches) {
    $id = $match.Groups[1].Value
    $title = $match.Groups[3].Value.Replace("''", "'")
    $challenge = $match.Groups[8].Value.Replace("''", "'").Trim()
    
    $lessons += [PSCustomObject]@{
        ID = $id
        Title = $title
        Challenge = $challenge
        WordCount = ($challenge -split '\s+').Count
    }
}

Write-Host "`nTotal lessons found: $($lessons.Count)"

# Save to JSON for Node.js to process
$lessons | ConvertTo-Json -Depth 10 | Out-File -Encoding utf8 'lessons_data.json'

Write-Host "Saved to lessons_data.json for analysis"
