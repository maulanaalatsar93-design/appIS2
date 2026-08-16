const fs = require('fs');
const path = require('path');

function processFile(filepath) {
    if (!fs.existsSync(filepath)) {
        return;
    }
        
    let content = fs.readFileSync(filepath, 'utf8');
        
    // Replace the main white card wrappers
    content = content.replace(
        /className="bg-white border border-\[#E2E8F0\] shadow-sm rounded-\[24px\]/g,
        'className="bg-white/80 backdrop-blur-xl border border-white ring-1 ring-gray-100/50 shadow-xl rounded-[32px]'
    );
    content = content.replace(
        /className="bg-white border border-\[#E2E8F0\] rounded-\[24px\]/g,
        'className="bg-white/80 backdrop-blur-xl border border-white ring-1 ring-gray-100/50 shadow-xl rounded-[32px]'
    );
    content = content.replace(
        /className="bg-white p-5 rounded-\[24px\]/g,
        'className="bg-white/80 backdrop-blur-xl border border-white ring-1 ring-gray-100/50 shadow-xl p-5 rounded-[32px]'
    );
    content = content.replace(
        /className="bg-white rounded-\[24px\] shadow-sm/g,
        'className="bg-white/80 backdrop-blur-xl border border-white ring-1 ring-gray-100/50 shadow-xl rounded-[32px]'
    );
    
    content = content.replace(
        /rounded-\[24px\]/g,
        'rounded-[32px]'
    );
    
    // Insert ambient glows right after the main layout wrapper
    if (content.includes('return (')) {
        if (content.includes('className="space-y-6 max-w-[1400px] mx-auto p-2"')) {
            content = content.replace(
                'className="space-y-6 max-w-[1400px] mx-auto p-2"',
                'className="space-y-8 max-w-[1400px] mx-auto p-2 relative"'
            );
            content = content.replace(
                '      <div className="space-y-8 max-w-[1400px] mx-auto p-2 relative">\n',
                '      <div className="space-y-8 max-w-[1400px] mx-auto p-2 relative">\n        {/* Ambient Glows */}\n        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1A4BC4]/5 blur-[120px] rounded-full pointer-events-none" />\n        <div className="absolute top-[40%] right-[-10%] w-[30%] h-[30%] bg-[#FF5722]/5 blur-[120px] rounded-full pointer-events-none" />\n'
            );
        }
    }

    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Processed ${filepath}`);
}

const files = [
    'src/pages/InternalDashboard.jsx',
    'src/pages/PublicDashboard.jsx',
    'src/components/dashboard/ManPowerDashboard.jsx'
];

files.forEach(processFile);
