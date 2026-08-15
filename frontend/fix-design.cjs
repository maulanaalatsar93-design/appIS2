const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = 'src/components';
const PAGES_DIR = 'src/pages';

function replaceClasses(match, classString) {
    let classes = classString.split(/\s+/);
    let newClasses = classes.map(c => {
        // Backgrounds
        if (c === 'bg-slate-900') return 'bg-navy-950';
        if (['bg-slate-800', 'bg-slate-800/50', 'bg-industrial-navyCard', 'bg-slate-800/80', 'bg-slate-800/90'].includes(c)) return 'bg-white';
        if (c === 'bg-slate-700') return 'bg-gray-50';
        if (['bg-blue-600', 'bg-blue-500', 'bg-industrial-blue', 'bg-indigo-600'].includes(c)) return 'bg-navy-600';
        if (['hover:bg-blue-700', 'hover:bg-blue-600', 'hover:bg-indigo-700'].includes(c)) return 'hover:bg-navy-950';
        if (c === 'hover:bg-slate-700') return 'hover:bg-navy-100';
        if (c === 'hover:bg-slate-800') return 'hover:bg-gray-50';
        if (c === 'bg-industrial-background') return 'bg-gray-50';
        if (['bg-industrial-navyDark', 'bg-industrial-navy'].includes(c)) return 'bg-navy-950';
        if (c === 'hover:bg-slate-700/50') return 'hover:bg-navy-100/50';
        
        // Borders
        if (['border-slate-700', 'border-slate-800', 'border-industrial-border'].includes(c)) return 'border-gray-200';
        if (['border-blue-500', 'border-blue-600'].includes(c)) return 'border-navy-600';
        if (['divide-slate-700', 'divide-slate-800'].includes(c)) return 'divide-gray-200';
        
        // Text
        if (['text-slate-100', 'text-slate-200', 'text-white', 'text-industrial-text'].includes(c)) return 'text-ink';
        if (['text-slate-300', 'text-slate-400', 'text-slate-500', 'text-industrial-muted'].includes(c)) return 'text-gray-500';
        if (['text-blue-400', 'text-blue-500', 'text-indigo-400', 'text-blue-600', 'text-indigo-600'].includes(c)) return 'text-navy-600';
        if (c === 'hover:text-white') return 'hover:text-ink';
        if (c === 'text-white/70') return 'text-gray-500';
        
        // Typography
        if (['text-xl', 'text-2xl', 'text-3xl', 'text-lg', 'text-4xl'].includes(c)) return `${c} font-display`;
        
        // Shadows & Radius
        if (c === 'shadow-soft-card') return 'shadow-md';
        if (['rounded-xl', 'rounded-card'].includes(c)) return 'rounded-lg';
        if (c === 'rounded-2xl') return 'rounded-xl';

        return c;
    });

    const hasDarkBg = newClasses.some(bg => ['bg-navy-600', 'bg-navy-950', 'bg-orange-500', 'bg-orange-600', 'bg-danger', 'bg-success'].includes(bg));
    
    if (hasDarkBg) {
        newClasses = newClasses.map(x => (['text-ink', 'text-gray-500'].includes(x)) ? 'text-white' : x);
        newClasses = newClasses.map(x => x === 'hover:text-ink' ? 'hover:text-white' : x);
    }

    return `className="${newClasses.join(' ')}"`;
}

function processFile(filepath) {
    const content = fs.readFileSync(filepath, 'utf8');
    
    let newContent = content.replace(/className="([^"]+)"/g, replaceClasses);

    // ApexCharts and inline colors
    newContent = newContent.replace(/'#3B82F6'/g, "'#18468B'");
    newContent = newContent.replace(/'#2563EB'/g, "'#18468B'");
    newContent = newContent.replace(/'#10B981'/g, "'#1E7F53'");
    newContent = newContent.replace(/'#F59E0B'/g, "'#EA853C'");
    newContent = newContent.replace(/'#EF4444'/g, "'#D6402C'");
    newContent = newContent.replace(/'#6366F1'/g, "'#18468B'");
    newContent = newContent.replace(/'#0F172A'/g, "'#0E2A52'");
    newContent = newContent.replace(/'#F0F3F8'/g, "'#F7F8FA'");
    newContent = newContent.replace(/'#94A3B8'/g, "'#9AA3B2'");

    const replaceTemplate = (match, inner) => {
        inner = inner.replace(/\bbg-slate-900\b/g, 'bg-navy-950')
                     .replace(/\bbg-slate-800\b/g, 'bg-white')
                     .replace(/\bbg-slate-700\b/g, 'bg-gray-50')
                     .replace(/\btext-slate-100\b/g, 'text-ink')
                     .replace(/\btext-slate-200\b/g, 'text-ink')
                     .replace(/\btext-white\b/g, 'text-ink')
                     .replace(/\btext-slate-400\b/g, 'text-gray-500')
                     .replace(/\btext-slate-300\b/g, 'text-gray-500')
                     .replace(/\bborder-slate-700\b/g, 'border-gray-200')
                     .replace(/\bborder-slate-800\b/g, 'border-gray-200')
                     .replace(/\bbg-blue-600\b/g, 'bg-navy-600')
                     .replace(/\bbg-blue-500\b/g, 'bg-navy-600');
        return `className={\`${inner}\`}`;
    };

    newContent = newContent.replace(/className=\{`([^`]+)`\}/g, replaceTemplate);

    if (content !== newContent) {
        fs.writeFileSync(filepath, newContent, 'utf8');
        console.log(`Updated ${filepath}`);
    }
}

function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            walkDir(filepath);
        } else if (filepath.endsWith('.jsx') || filepath.endsWith('.js')) {
            processFile(filepath);
        }
    }
}

walkDir(COMPONENTS_DIR);
walkDir(PAGES_DIR);
