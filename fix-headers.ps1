$files = @(
    "frontend\src\pages\InternalDashboard.jsx",
    "frontend\src\pages\PublicDashboard.jsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content -Raw $file
        
        # Replace the dark background with a premium gradient
        $content = $content -replace 'bg-\[#13254F\]', 'bg-gradient-to-r from-[#0F2052] to-[#1A4BC4]'
        $content = $content -replace 'bg-\[#0F172A\]', 'bg-gradient-to-r from-[#0F172A] to-[#1E293B]'
        
        # Replace text-ink with text-white/90 ONLY on specific known headers
        $content = $content -replace 'text-sm font-bold text-ink flex items-center gap-2', 'text-sm font-bold text-white/90 flex items-center gap-2'
        $content = $content -replace 'text-\[10px\] bg-white/20 text-ink font-semibold', 'text-[10px] bg-white/20 text-white/90 font-semibold'
        $content = $content -replace 'text-\[10px\] bg-white/20 text-ink', 'text-[10px] bg-white/20 text-white/90'
        
        Set-Content -Path $file -Value $content
        Write-Host "Processed $file"
    }
}
