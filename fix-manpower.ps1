$file = "frontend\src\components\dashboard\ManPowerDashboard.jsx"
if (Test-Path $file) {
    $content = Get-Content -Raw $file
    
    # 1. Chart absolute headers
    $content = $content -replace 'bg-\[#0f172a\] text-ink', 'bg-gradient-to-r from-[#0F2052] to-[#1A4BC4] text-white/90 shadow-md'
    $content = $content -replace 'bg-\[#0f172a\] text-white', 'bg-gradient-to-r from-[#0F2052] to-[#1A4BC4] text-white/90 shadow-md'
    
    # 2. Table headers
    $content = $content -replace 'bg-\[#1E293B\] text-ink', 'bg-gradient-to-r from-[#193B8F] to-[#2563EB] text-white/90 shadow-md'
    $content = $content -replace 'bg-\[#EAB308\] text-ink', 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white/90 shadow-md'
    $content = $content -replace 'bg-\[#EA580C\] text-ink', 'bg-gradient-to-r from-[#EA580C] to-[#C2410C] text-white/90 shadow-md'
    
    # 3. ApexChart title background
    $content = $content -replace "background: '#0f172a'", "background: 'transparent'"
    $content = $content -replace "color: '#ffffff'", "color: '#0F172A'"
    
    # Also fix table column headers font color if necessary, but slate-600 is fine.
    
    Set-Content -Path $file -Value $content
    Write-Host "Processed $file"
}
