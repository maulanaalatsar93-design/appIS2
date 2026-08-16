$file = "frontend\src\pages\InternalDashboard.jsx"
$content = Get-Content -Raw $file

# Regex replacements are tricky for huge blocks. I'll use multi_replace_file_content in the next step.
Write-Host "Prepared"
