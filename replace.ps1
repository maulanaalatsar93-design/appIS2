$files = @("frontend\src\pages\InternalDashboard.jsx", "frontend\src\pages\PublicDashboard.jsx", "frontend\src\components\dashboard\ManPowerDashboard.jsx")

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content -Raw $file
        
        # Replace white cards with premium glassmorphism
        $content = $content -replace 'bg-white rounded-xl shadow-sm border border-slate-200', 'bg-white/80 backdrop-blur-xl rounded-[24px] shadow-xl ring-1 ring-gray-100/50 border border-white'
        $content = $content -replace 'bg-white rounded-2xl shadow-sm border border-[#E2E8F0]', 'bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl ring-1 ring-gray-100/50 border border-white'
        $content = $content -replace 'bg-white border border-[#E2E8F0] shadow-sm', 'bg-white/90 backdrop-blur-md border border-white shadow-xl ring-1 ring-gray-100/50'
        $content = $content -replace 'bg-white border border-gray-200 shadow-sm-subtle', 'bg-white/90 backdrop-blur-md border border-white shadow-xl ring-1 ring-gray-100/50'
        
        # Upgrade rounding
        $content = $content -replace 'rounded-lg', 'rounded-2xl'
        
        # Add glows behind the main grid/container in InternalDashboard
        $content = $content -replace '<div className="space-y-6 max-w-\[1400px\] mx-auto p-4 md:p-6 lg:p-8 relative">', '<div className="space-y-8 max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 relative">`n<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#1A4BC4]/5 blur-[120px] rounded-full pointer-events-none" />`n<div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#EA853C]/5 blur-[120px] rounded-full pointer-events-none" />'

        Set-Content -Path $file -Value $content
        Write-Host "Processed $file"
    }
}
