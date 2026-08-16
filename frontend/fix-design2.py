import os

def process_file(filepath):
    if not os.path.exists(filepath):
        return
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replace the main white card wrappers
    # Target: `bg-white border border-[#E2E8F0] rounded-[24px] shadow-sm`
    content = content.replace(
        'className="bg-white border border-[#E2E8F0] shadow-sm rounded-[24px]',
        'className="bg-white/80 backdrop-blur-xl border border-white ring-1 ring-gray-100/50 shadow-xl rounded-[32px]'
    )
    content = content.replace(
        'className="bg-white border border-[#E2E8F0] rounded-[24px]',
        'className="bg-white/80 backdrop-blur-xl border border-white ring-1 ring-gray-100/50 shadow-xl rounded-[32px]'
    )
    content = content.replace(
        'className="bg-white p-5 rounded-[24px]',
        'className="bg-white/80 backdrop-blur-xl border border-white ring-1 ring-gray-100/50 shadow-xl p-5 rounded-[32px]'
    )
    content = content.replace(
        'className="bg-white rounded-[24px] shadow-sm',
        'className="bg-white/80 backdrop-blur-xl border border-white ring-1 ring-gray-100/50 shadow-xl rounded-[32px]'
    )
    
    # Also replace some other basic containers
    content = content.replace(
        'rounded-[24px]',
        'rounded-[32px]'
    )
    
    # Insert ambient glows right after the main <div className="space-y-6"> or similar layout wrapper
    if 'return (' in content:
        # For InternalDashboard
        if 'className="space-y-6 max-w-[1400px] mx-auto p-2"' in content:
            content = content.replace(
                'className="space-y-6 max-w-[1400px] mx-auto p-2"',
                'className="space-y-8 max-w-[1400px] mx-auto p-2 relative"'
            )
            content = content.replace(
                '      <div className="space-y-8 max-w-[1400px] mx-auto p-2 relative">\n',
                '      <div className="space-y-8 max-w-[1400px] mx-auto p-2 relative">\n        {/* Ambient Glows */}\n        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1A4BC4]/5 blur-[120px] rounded-full pointer-events-none" />\n        <div className="absolute top-[40%] right-[-10%] w-[30%] h-[30%] bg-[#FF5722]/5 blur-[120px] rounded-full pointer-events-none" />\n'
            )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Processed {filepath}")

# Process files
files = [
    'src/pages/InternalDashboard.jsx',
    'src/pages/PublicDashboard.jsx',
    'src/components/dashboard/ManPowerDashboard.jsx'
]

for file in files:
    process_file(file)
