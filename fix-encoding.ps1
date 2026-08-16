$files = Get-ChildItem -Path "frontend" -Recurse -Include *.jsx, *.js, *.css, *.html

foreach ($f in $files) {
    $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
    if ($bytes.Length -ge 2 -and $bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) {
        # It is UTF-16 LE (BOM FF FE)
        $text = [System.IO.File]::ReadAllText($f.FullName)
        $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($f.FullName, $text, $utf8NoBom)
        Write-Host "Converted $($f.Name) to UTF-8"
    }
}
Write-Host "Done encoding check."
