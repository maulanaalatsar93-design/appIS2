$files = Get-ChildItem -Path "frontend\src" -Recurse -Include *.jsx, *.js, *.css, *.html

foreach ($f in $files) {
    $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
    if ($bytes -contains 0) {
        # File has null bytes, likely UTF-16LE without BOM
        Write-Host "Converting $($f.Name) from UTF-16LE to UTF-8"
        $text = [System.Text.Encoding]::Unicode.GetString($bytes)
        $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($f.FullName, $text, $utf8NoBom)
    }
}
Write-Host "Done."
