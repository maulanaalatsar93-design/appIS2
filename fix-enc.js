const fs = require('fs');
const path = require('path');

function fixEncoding(filePath) {
    let buffer = fs.readFileSync(filePath);
    // Check if it's UTF-16 LE
    let isUtf16Le = true;
    for (let i = 1; i < Math.min(buffer.length, 1000); i += 2) {
        if (buffer[i] !== 0 && buffer[i] !== 32) { // 32 is space in utf16 high byte if it's some other char? No, English chars have 0 in high byte.
            // basic heuristic
        }
    }
    
    // Actually, Node fs.readFileSync with 'utf16le' works if we just test it.
    // Let's just decode it as utf8. If it contains lots of nulls, it's utf16le.
    if (buffer.includes(0x00)) {
        console.log("Converting from UTF-16LE: " + filePath);
        let text = buffer.toString('utf16le');
        fs.writeFileSync(filePath, text, 'utf8');
    }
}

function walkDir(dir) {
    let files = fs.readdirSync(dir);
    for (let f of files) {
        let p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) {
            walkDir(p);
        } else if (p.endsWith('.jsx') || p.endsWith('.js') || p.endsWith('.md')) {
            fixEncoding(p);
        }
    }
}

walkDir('frontend/src');
