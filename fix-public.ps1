$file = "frontend\src\pages\PublicDashboard.jsx"
$content = Get-Content -Raw $file

# 1. Update Scorecards (Work Order)
$content = $content -replace '''bg-gradient-to-r from-\[#0F2052\] to-\[#1A4BC4\]''', '''bg-gradient-to-br from-blue-600 to-blue-800'''
$content = $content -replace '''border-\[#13254F\]''', '''border-blue-700/50'''

$content = $content -replace '''bg-\[#1A4BC4\]''', '''bg-gradient-to-br from-emerald-500 to-emerald-700'''
$content = $content -replace '''border-\[#1A4BC4\]''', '''border-emerald-600/50'''

$content = $content -replace '''bg-\[#D9650F\]''', '''bg-gradient-to-br from-orange-500 to-orange-700'''
$content = $content -replace '''border-\[#D9650F\]''', '''border-orange-600/50'''

# 2. Update Scorecards (Rekomendasi)
$content = $content -replace '''bg-gradient-to-r from-\[#0F5A51\] to-\[#168477\]''', '''bg-gradient-to-br from-red-500 to-red-700'''
$content = $content -replace '''border-\[#168477\]''', '''border-red-600/50'''

$content = $content -replace '''bg-\[#059669\]''', '''bg-gradient-to-br from-teal-500 to-teal-700'''
$content = $content -replace '''border-\[#059669\]''', '''border-teal-600/50'''

$content = $content -replace '''bg-\[#D97706\]''', '''bg-gradient-to-br from-purple-500 to-purple-700'''
$content = $content -replace '''border-\[#D97706\]''', '''border-purple-600/50'''

# 3. Clean up Chart Headers (Work Order per Pabrik & Distribusi Tipe Order)
$content = $content -replace '<div className="px-5 py-3\.5 bg-gradient-to-r from-\[#0F2052\] to-\[#1A4BC4\] text-ink">
            <h4 className="text-sm font-bold text-ink tracking-tight">Work Order per Pabrik</h4>
            <p className="text-\[11px\] text-ink mt-0\.5">Total perbandingan WO berdasarkan area pabrik\.</p>', '<div className="px-5 py-4 bg-white border-b border-gray-100 rounded-t-2xl">
            <h4 className="text-sm font-bold text-slate-800 tracking-tight">Work Order per Pabrik</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">Total perbandingan WO berdasarkan area pabrik.</p>'

$content = $content -replace '<div className="px-5 py-3\.5 bg-gradient-to-r from-\[#0F2052\] to-\[#1A4BC4\] text-ink">
            <h4 className="text-sm font-bold text-ink tracking-tight">Distribusi Tipe Order</h4>
            <p className="text-\[11px\] text-ink mt-0\.5">Proporsi Work Order berdasarkan tipe \(PM04 vs PM02\+\)\.</p>', '<div className="px-5 py-4 bg-white border-b border-gray-100 rounded-t-2xl">
            <h4 className="text-sm font-bold text-slate-800 tracking-tight">Distribusi Tipe Order</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">Proporsi Work Order berdasarkan tipe (PM04 vs PM02+).</p>'

# 4. Clean up Chart Headers (Rekomendasi)
$content = $content -replace '<div className="px-5 py-3\.5 bg-gradient-to-r from-\[#0F5A51\] to-\[#168477\] text-white/90 shadow-md">
            <h4 className="text-sm font-bold text-ink tracking-tight">Rilis Rekomendasi per Pabrik</h4>
            <p className="text-\[11px\] text-teal-100 mt-0\.5">Perbandingan rilis rekomendasi berdasarkan area pabrik\.</p>', '<div className="px-5 py-4 bg-white border-b border-gray-100 rounded-t-2xl">
            <h4 className="text-sm font-bold text-slate-800 tracking-tight">Rilis Rekomendasi per Pabrik</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">Perbandingan rilis rekomendasi berdasarkan area pabrik.</p>'

$content = $content -replace '<div className="px-5 py-3\.5 bg-gradient-to-r from-\[#0F5A51\] to-\[#168477\] text-white/90 shadow-md">
            <h4 className="text-sm font-bold text-ink tracking-tight">Rekomendasi \(M4 & M7\)</h4>
            <p className="text-\[11px\] text-teal-100 mt-0\.5">Proporsi rekomendasi berdasarkan status rilis\.</p>', '<div className="px-5 py-4 bg-white border-b border-gray-100 rounded-t-2xl">
            <h4 className="text-sm font-bold text-slate-800 tracking-tight">Rekomendasi (M4 & M7)</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">Proporsi rekomendasi berdasarkan status rilis.</p>'

Set-Content -Path $file -Value $content
Write-Host "Replaced PublicDashboard.jsx with clean, vibrant theme."
