$kpiFile = "frontend\src\components\ui\KPICard.jsx"
if (Test-Path $kpiFile) {
    $content = Get-Content -Raw $kpiFile
    $content = $content -replace 'case ''navy'': return ''bg-gradient-to-br from-\[#0F2052\] to-\[#1A4BC4\].*?''', "case 'navy': return 'bg-gradient-to-br from-blue-600 to-blue-800 border-white/10 shadow-[0_8px_30px_rgba(37,99,235,0.35)] ring-1 ring-white/10 text-white';"
    $content = $content -replace 'case ''blue'': return ''bg-gradient-to-br from-\[#1E40AF\] to-\[#3B82F6\].*?''', "case 'blue': return 'bg-gradient-to-br from-blue-500 to-blue-700 border-white/10 shadow-[0_8px_30px_rgba(59,130,246,0.35)] ring-1 ring-white/10 text-white';"
    $content = $content -replace 'case ''teal'': return ''bg-gradient-to-br from-\[#0F766E\] to-\[#14B8A6\].*?''', "case 'teal': return 'bg-gradient-to-br from-emerald-500 to-emerald-700 border-white/10 shadow-[0_8px_30px_rgba(16,185,129,0.35)] ring-1 ring-white/10 text-white';"
    $content = $content -replace 'case ''orange'': return ''bg-gradient-to-br from-\[#C2410C\] to-\[#F97316\].*?''', "case 'orange': return 'bg-gradient-to-br from-orange-500 to-orange-700 border-white/10 shadow-[0_8px_30px_rgba(249,115,22,0.35)] ring-1 ring-white/10 text-white';"
    $content = $content -replace 'case ''red'': return ''bg-gradient-to-br from-\[#991B1B\] to-\[#EF4444\].*?''', "case 'red': return 'bg-gradient-to-br from-red-500 to-red-700 border-white/10 shadow-[0_8px_30px_rgba(239,68,68,0.35)] ring-1 ring-white/10 text-white';"
    $content = $content -replace 'case ''rose'': return ''bg-gradient-to-br from-\[#BE123C\] to-\[#F43F5E\].*?''', "case 'rose': return 'bg-gradient-to-br from-rose-500 to-rose-700 border-white/10 shadow-[0_8px_30px_rgba(244,63,94,0.35)] ring-1 ring-white/10 text-white';"
    Set-Content -Path $kpiFile -Value $content
}

$internalFile = "frontend\src\pages\InternalDashboard.jsx"
if (Test-Path $internalFile) {
    $content = Get-Content -Raw $internalFile
    
    # 1. Update Job Load Scorecards Colors to Vibrant
    $content = $content -replace 'bg-gradient-to-r from-\[#0F2052\] to-\[#1A4BC4\]', 'bg-gradient-to-br from-blue-600 to-blue-800'
    $content = $content -replace 'border-\[#0A1B3F\]/20', 'border-blue-700/50'
    
    $content = $content -replace 'bg-gradient-to-r from-\[#193B8F\] to-\[#1A4BC4\]', 'bg-gradient-to-br from-emerald-500 to-emerald-700'
    $content = $content -replace 'border-\[#0D3299\]/20', 'border-emerald-600/50'
    
    $content = $content -replace 'bg-gradient-to-r from-\[#D9650F\] to-\[#FF7410\]', 'bg-gradient-to-br from-orange-500 to-orange-700'
    $content = $content -replace 'border-\[#FF7410\]/20', 'border-orange-600/50'

    # 2. Update Progress Bars in Job Load to mimic the mockup's cleaner style
    # The mockup uses a green (#16A34A) bar on a light gray background for the main progress. 
    # But since these are on solid colored backgrounds, a white bar works well. We will leave the bar colors as is since they are already readable on dark.
    
    # 3. Clean up chart headers across Overview & Job Load to be White with Dark text
    # Overview - ManPower Detailed Scorecards header
    $content = $content -replace 'bg-gradient-to-r from-\[#0F2052\] via-\[#1A4BC4\] to-\[#1e56d9\] px-6 py-5', 'bg-white border-b border-gray-100 px-6 py-5'
    $content = $content -replace 'text-blue-200', 'text-gray-500'
    $content = $content -replace 'text-white font-extrabold', 'text-slate-800 font-extrabold'
    
    # Overview - Trend Chart header
    $content = $content -replace 'bg-gradient-to-r from-\[#0A1B3F\] to-\[#1A4BC4\]', 'bg-white border-b border-gray-100'
    $content = $content -replace 'text-ink flex items-center gap-2', 'text-slate-800 flex items-center gap-2'
    $content = $content -replace 'text-ink mt-0\.5', 'text-gray-500 mt-0.5'
    
    # Job Load - Chart 1 (Distribusi Status WO)
    $content = $content -replace '<div className="px-4 py-3 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-between">
                <h4 className="text-sm font-bold text-white/90 flex items-center gap-2">', '<div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">'
                
    # Job Load - Chart 2 (Distribusi Tipe PM)
    # The replacement above might miss something, so let's use a regex replace for the chart headers
    # Specifically looking for the table/chart headers in Job Load
    $content = $content -replace '<div className="flex items-center justify-between px-4 py-3 bg-gradient-to-br from-blue-600 to-blue-800">
                <h4 className="text-sm font-bold text-white/90 flex items-center gap-2">', '<div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 rounded-t-2xl">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">'
                
    # Performance Killer - Table Header
    $content = $content -replace 'bg-gradient-to-r from-\[#7F1D1D\] to-\[#B91C1C\]', 'bg-white border-b border-gray-100'
    $content = $content -replace 'text-base font-bold text-white/90 flex items-center gap-2', 'text-base font-bold text-slate-800 flex items-center gap-2'
    $content = $content -replace 'bg-white text-\[#8B0000\]', 'bg-red-50 text-red-700 hover:bg-red-100'
    
    Set-Content -Path $internalFile -Value $content
}

Write-Host "Updated InternalDashboard and KPICard to match vibrant mockup aesthetic."
