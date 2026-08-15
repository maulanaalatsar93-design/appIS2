import os
import re

COMPONENTS_DIR = 'src/components'
PAGES_DIR = 'src/pages'

def replace_classes(match):
    class_string = match.group(1)
    classes = class_string.split()
    new_classes = []
    for c in classes:
        # Backgrounds
        if c == 'bg-slate-900': c = 'bg-navy-950'
        elif c in ['bg-slate-800', 'bg-slate-800/50', 'bg-industrial-navyCard', 'bg-slate-800/80']: c = 'bg-white'
        elif c == 'bg-slate-700': c = 'bg-gray-50'
        elif c in ['bg-blue-600', 'bg-blue-500', 'bg-industrial-blue', 'bg-indigo-600']: c = 'bg-navy-600'
        elif c in ['hover:bg-blue-700', 'hover:bg-blue-600', 'hover:bg-indigo-700']: c = 'hover:bg-navy-950'
        elif c == 'hover:bg-slate-700': c = 'hover:bg-navy-100'
        elif c == 'hover:bg-slate-800': c = 'hover:bg-gray-50'
        elif c == 'bg-industrial-background': c = 'bg-gray-50'
        elif c == 'bg-industrial-navyDark': c = 'bg-navy-950'
        elif c == 'bg-industrial-navy': c = 'bg-navy-950'
        elif c == 'hover:bg-slate-700/50': c = 'hover:bg-navy-100/50'
        
        # Borders
        elif c in ['border-slate-700', 'border-slate-800', 'border-industrial-border']: c = 'border-gray-200'
        elif c in ['border-blue-500', 'border-blue-600']: c = 'border-navy-600'
        elif c in ['divide-slate-700', 'divide-slate-800']: c = 'divide-gray-200'
        
        # Text
        elif c in ['text-slate-100', 'text-slate-200', 'text-white', 'text-industrial-text']: 
            c = 'text-ink'
        elif c in ['text-slate-300', 'text-slate-400', 'text-slate-500', 'text-industrial-muted']: c = 'text-gray-500'
        elif c in ['text-blue-400', 'text-blue-500', 'text-indigo-400']: c = 'text-navy-600'
        elif c in ['text-blue-600', 'text-indigo-600']: c = 'text-navy-600'
        elif c == 'hover:text-white': c = 'hover:text-ink'
        
        # Typography
        elif c in ['text-xl', 'text-2xl', 'text-3xl', 'text-lg', 'text-4xl']: c = f"{c} font-display"
        
        # Shadows & Radius
        elif c == 'shadow-soft-card': c = 'shadow-md'
        elif c in ['rounded-xl', 'rounded-card']: c = 'rounded-lg'
        elif c == 'rounded-2xl': c = 'rounded-xl'

        new_classes.append(c)
    
    # Smart context override
    has_dark_bg = any(bg in new_classes for bg in ['bg-navy-600', 'bg-navy-950', 'bg-orange-500', 'bg-orange-600', 'bg-danger', 'bg-success'])
    if has_dark_bg:
        new_classes = ['text-white' if x in ['text-ink', 'text-gray-500'] else x for x in new_classes]
        new_classes = ['hover:text-white' if x == 'hover:text-ink' else x for x in new_classes]
    
    return f'className="{ " ".join(new_classes) }"'

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = re.sub(r'className="([^"]+)"', replace_classes, content)
    
    # ApexCharts and inline colors
    new_content = new_content.replace("'#3B82F6'", "'#18468B'")
    new_content = new_content.replace("'#2563EB'", "'#18468B'")
    new_content = new_content.replace("'#10B981'", "'#1E7F53'")
    new_content = new_content.replace("'#F59E0B'", "'#EA853C'")
    new_content = new_content.replace("'#EF4444'", "'#D6402C'")
    new_content = new_content.replace("'#6366F1'", "'#18468B'")
    new_content = new_content.replace("'#0F172A'", "'#0E2A52'")
    new_content = new_content.replace("'#F0F3F8'", "'#F7F8FA'")
    new_content = new_content.replace("'#94A3B8'", "'#9AA3B2'")

    # Extra passes for backtick templates `className={\`... \`}`
    # This regex is simplified and matches simple backtick templates without complex nesting
    def replace_template(match):
        inner = match.group(1)
        # only replace exact words
        inner = re.sub(r'\bbg-slate-900\b', 'bg-navy-950', inner)
        inner = re.sub(r'\bbg-slate-800\b', 'bg-white', inner)
        inner = re.sub(r'\bbg-slate-700\b', 'bg-gray-50', inner)
        inner = re.sub(r'\btext-slate-100\b', 'text-ink', inner)
        inner = re.sub(r'\btext-slate-200\b', 'text-ink', inner)
        inner = re.sub(r'\btext-white\b', 'text-ink', inner) # naive, but okay for cards
        inner = re.sub(r'\btext-slate-400\b', 'text-gray-500', inner)
        inner = re.sub(r'\btext-slate-300\b', 'text-gray-500', inner)
        inner = re.sub(r'\bborder-slate-700\b', 'border-gray-200', inner)
        inner = re.sub(r'\bborder-slate-800\b', 'border-gray-200', inner)
        inner = re.sub(r'\bbg-blue-600\b', 'bg-navy-600', inner)
        inner = re.sub(r'\bbg-blue-500\b', 'bg-navy-600', inner)
        return f'className={{`{inner}`}}'
        
    new_content = re.sub(r'className=\{`([^`]+)`\}', replace_template, new_content)

    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(COMPONENTS_DIR):
    for f in files:
        if f.endswith('.jsx') or f.endswith('.js'):
            process_file(os.path.join(root, f))

for root, _, files in os.walk(PAGES_DIR):
    for f in files:
        if f.endswith('.jsx') or f.endswith('.js'):
            process_file(os.path.join(root, f))
