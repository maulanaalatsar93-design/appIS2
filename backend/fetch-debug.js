import fetch from 'node-fetch';
import fs from 'fs';

async function run() {
  try {
    const res = await fetch('http://localhost:5000/api/dashboard/notifications?debug_shofwan=true');
    const data = await res.json();
    fs.writeFileSync('shofwan-debug.json', JSON.stringify(data, null, 2));
    console.log('Saved to shofwan-debug.json');
  } catch (err) {
    console.error(err);
  }
}
run();
