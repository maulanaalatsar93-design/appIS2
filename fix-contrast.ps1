$internal = "frontend\src\pages\InternalDashboard.jsx"
$public = "frontend\src\pages\PublicDashboard.jsx"

# Internal Dashboard Fixes
if (Test-Path $internal) {
    $content = Get-Content -Raw $internal
    
    # 1. PM02+ Breakdown Table Header
    $content = $content -replace 'bg-\[#D9650F\]', 'bg-gradient-to-r from-[#D9650F] to-[#FF7410]'
    $content = $content -replace '<div className="px-5 py-3.5 bg-gradient-to-r from-\[#D9650F\] to-\[#FF7410\] text-ink">', '<div className="px-5 py-3.5 bg-gradient-to-r from-[#D9650F] to-[#FF7410] text-white/90 shadow-md">'
    
    # 2. Tutup Detail button hover state
    $content = $content -replace 'hover:bg-slate-900 text-ink', 'hover:bg-[#0A1B3F] hover:text-white/90 text-[#0A1B3F] border border-gray-200 shadow-sm'
    
    # 3. Organik Badge
    $content = $content -replace '''bg-navy-950 text-ink''', '''bg-[#0F2052] text-white/90 shadow-sm'''
    
    Set-Content -Path $internal -Value $content
    Write-Host "Fixed Internal Dashboard contrast issues."
}

# Public Dashboard Fixes
if (Test-Path $public) {
    $content = Get-Content -Raw $public
    
    # 1. Rekomendasi Breakdown Table Header
    $content = $content -replace 'bg-\[#168477\]', 'bg-gradient-to-r from-[#0F5A51] to-[#168477]'
    $content = $content -replace '<div className="px-5 py-3.5 bg-gradient-to-r from-\[#0F5A51\] to-\[#168477\] text-ink">', '<div className="px-5 py-3.5 bg-gradient-to-r from-[#0F5A51] to-[#168477] text-white/90 shadow-md">'
    
    # 2. Tutup Detail button hover state
    $content = $content -replace 'hover:bg-slate-900 text-ink', 'hover:bg-[#0A1B3F] hover:text-white/90 text-[#0A1B3F] border border-gray-200 shadow-sm'
    
    Set-Content -Path $public -Value $content
    Write-Host "Fixed Public Dashboard contrast issues."
}
