# Read SQL file as raw text
$sqlContent = Get-Content 'ascevo/supabase/lessons_all_pillars.sql' -Raw -Encoding UTF8

# Find all occurrences of card_challenge followed by VALUES and extract individual lessons
# Split by lesson UUID pattern to find boundaries
$lessonPattern = "(?s)'(33333333-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})','([0-9a-f-]+)','([^']+?)',(\d+),"

$allMatches = [regex]::Matches($sqlContent, $lessonPattern)

Write-Host "Found $($allMatches.Count) lesson starts"

# For each match, extract the full lesson including all 5 card fields
$lessons = @()
$processed = 0

foreach ($match in $allMatches) {
    $lessonId = $match.Groups[1].Value
    $title = $match.Groups[3].Value.Replace("''", "'")
    
    # Find the position after this match
    $startPos = $match.Index + $match.Length
    
    # Extract the next 5 quoted strings (concept, example, mistake, science, challenge)
    # We need to carefully parse quoted strings handling escaped quotes
    
    $remaining = $sqlContent.Substring($startPos)
    
    # Find the 5th quoted string (challenge) by parsing carefully
    $quoteCount = 0
    $inQuote = $false
    $currentString = ""
    $strings = @()
    
    for ($i = 0; $i -lt $remaining.Length -and $quoteCount < 5; $i++) {
        $char = $remaining[$i]
        
        if ($char -eq "'" -and $i -gt 0 -and $remaining[$i-1] -ne "'") {
            if (-not $inQuote) {
                # Starting a new string
                $inQuote = $true
                $currentString = ""
            } else {
                # Check if next char is also a quote (escaped)
                if ($i+1 -lt $remaining.Length -and $remaining[$i+1] -eq "'") {
                    $currentString += "''"
                    $i++ # Skip next quote
                } else {
                    # Ending current string
                    $inQuote = $false
                    $strings += $currentString.Replace("''", "'")
                    $quoteCount++
                    $currentString = ""
                }
            }
        } elseif ($inQuote) {
            $currentString += $char
        }
    }
    
    if ($strings.Count -ge 5) {
        $challenge = $strings[4].Trim()
        $wordCount = ($challenge -split '\s+').Count
        
        $lessons += [PSCustomObject]@{
            ID = $lessonId
            Title = $title
            Challenge = $challenge
            WordCount = $wordCount
        }
        $processed++
    }
}

Write-Host "Successfully extracted $processed lessons with challenges"

# Save to JSON
$lessons | ConvertTo-Json -Depth 10 | Out-File -Encoding UTF8 'lessons_complete.json'
Write-Host "Saved to lessons_complete.json"
