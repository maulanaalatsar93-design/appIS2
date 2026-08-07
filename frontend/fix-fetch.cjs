const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      walk(filepath, callback);
    } else {
      callback(filepath);
    }
  });
}

const targetDir = path.join(__dirname, 'src');

walk(targetDir, (filepath) => {
  if (filepath.endsWith('.js') || filepath.endsWith('.jsx')) {
    let content = fs.readFileSync(filepath, 'utf8');
    let changed = false;

    // Replace fetch('/api/...)
    const regex1 = /fetch\s*\(\s*['"]\/api\//g;
    if (regex1.test(content)) {
      content = content.replace(regex1, "fetch((import.meta.env.VITE_API_URL || '').replace(/\\/$/, '') + '/api/");
      changed = true;
    }

    // Replace fetch(`/api/...)
    const regex2 = /fetch\s*\(\s*`\/api\//g;
    if (regex2.test(content)) {
      content = content.replace(regex2, "fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\\/$/, '')}/api/");
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filepath, content, 'utf8');
      console.log(`Updated: ${filepath}`);
    }
  }
});

console.log("Done updating fetch calls!");
