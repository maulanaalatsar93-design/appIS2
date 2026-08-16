$file = "frontend\src\pages\InternalDashboard.jsx"
$content = Get-Content -Raw $file

# 1. Job Load & Progress - Semua PM Card fixes
$content = $content -replace '<div className="text-4xl font-display font-extrabold text-ink tracking-tight">\{summary\?\.kpi\?\.totalWO \? summary\.kpi\.totalWO\.toLocaleString\(''id-ID''\) : ''0''\}</div>', '<div className="text-4xl font-display font-extrabold text-white/90 tracking-tight">{summary?.kpi?.totalWO ? summary.kpi.totalWO.toLocaleString(''id-ID'') : ''0''}</div>'
$content = $content -replace '<span>● CNF: <strong className="text-ink">\{summary\?\.jobLoadDetails\?\.gauges\?\.cnfCount \|\| ''—''\}</strong> WO</span>', '<span>● CNF: <strong className="text-white/90">{summary?.jobLoadDetails?.gauges?.cnfCount || ''—''}</strong> WO</span>'
$content = $content -replace '<span>● Total: <strong className="text-ink">\{summary\?\.kpi\?\.totalWO \|\| 0\}</strong> WO</span>', '<span>● Total: <strong className="text-white/90">{summary?.kpi?.totalWO || 0}</strong> WO</span>'

# 2. Job Load & Progress - PM04 Card fixes
$content = $content -replace 'bg-\[#1A4BC4\]', 'bg-gradient-to-r from-[#193B8F] to-[#1A4BC4]'
$content = $content -replace '<div className="text-4xl font-display font-extrabold text-ink tracking-tight">\{summary\?\.kpi\?\.pm04Count \? summary\.kpi\.pm04Count\.toLocaleString\(''id-ID''\) : ''0''\}</div>', '<div className="text-4xl font-display font-extrabold text-white/90 tracking-tight">{summary?.kpi?.pm04Count ? summary.kpi.pm04Count.toLocaleString(''id-ID'') : ''0''}</div>'
$content = $content -replace '<span>● CNF: <strong className="text-ink">\{summary\?\.jobLoadDetails\?\.gauges\?\.pm04CnfCount \|\| ''—''\}</strong> WO</span>', '<span>● CNF: <strong className="text-white/90">{summary?.jobLoadDetails?.gauges?.pm04CnfCount || ''—''}</strong> WO</span>'
$content = $content -replace '<span>● Total: <strong className="text-ink">\{summary\?\.kpi\?\.pm04Count \|\| 0\}</strong> WO</span>', '<span>● Total: <strong className="text-white/90">{summary?.kpi?.pm04Count || 0}</strong> WO</span>'

# 3. Job Load & Progress - PM02+ Card fixes
$content = $content -replace 'bg-\[#FF7410\]', 'bg-gradient-to-r from-[#D9650F] to-[#FF7410]'
$content = $content -replace '<div className="text-4xl font-display font-extrabold text-ink tracking-tight">\{summary\?\.kpi\?\.pm02PlusCount \? summary\.kpi\.pm02PlusCount\.toLocaleString\(''id-ID''\) : ''0''\}</div>', '<div className="text-4xl font-display font-extrabold text-white/90 tracking-tight">{summary?.kpi?.pm02PlusCount ? summary.kpi.pm02PlusCount.toLocaleString(''id-ID'') : ''0''}</div>'
$content = $content -replace '<span>● CNF: <strong className="text-ink">\{summary\?\.jobLoadDetails\?\.gauges\?\.pm02PlusCnfCount \|\| ''—''\}</strong> WO</span>', '<span>● CNF: <strong className="text-white/90">{summary?.jobLoadDetails?.gauges?.pm02PlusCnfCount || ''—''}</strong> WO</span>'
$content = $content -replace '<span>● Total: <strong className="text-ink">\{summary\?\.kpi\?\.pm02PlusCount \|\| 0\}</strong> WO</span>', '<span>● Total: <strong className="text-white/90">{summary?.kpi?.pm02PlusCount || 0}</strong> WO</span>'

# 4. Performance Killer - Table Header fixes
$content = $content -replace 'bg-\[#8B0000\]', 'bg-gradient-to-r from-[#7F1D1D] to-[#B91C1C]'
$content = $content -replace 'text-base font-bold text-ink flex items-center gap-2', 'text-base font-bold text-white/90 flex items-center gap-2'

# Write back
Set-Content -Path $file -Value $content
Write-Host "Replaced Job Load & Progress and Performance Killer specific styling."
