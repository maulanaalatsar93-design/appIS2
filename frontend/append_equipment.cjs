const fs = require('fs');

const raw = `KPI	Lapangan
K3	Kantor
Kan. Pusat	Kantor
Kan. Management Vendor	Kantor
ISTEK 2	Kantor
Workshop Listrik	Rewinding
Workshop Listrik	Kantor
Workshop Permesinan	Area Welding
Workshop Permesinan	Area Machining
Workshop Permesinan	Kantor
Workshop Permesinan	Balancing
JPP	Area Machining
JPP	Kantor
JPP	Sandblast
JPP	Fabrikasi
Area Luar Pabrik	Rumah Sakit
Area Luar Pabrik	Samsat
Receiving	Kan. receiving
Receiving	Gd, receiving
Pemeliharaan	Gedung Pemeliharaan`;

const newData = raw.split('\n').filter(l => l.trim()).map(l => {
  const [pabrik, area] = l.split('\t');
  return {
    pabrik: pabrik.trim(),
    area: area.trim(),
    equipment: "-",
    description: "-"
  };
});

const filePath = './src/data/equipmentData.json';
let currentData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Filter out already added non-plants if any to avoid duplication
const newPabriks = new Set(newData.map(d => d.pabrik));
currentData = currentData.filter(d => !newPabriks.has(d.pabrik));

const combined = [...currentData, ...newData];
fs.writeFileSync(filePath, JSON.stringify(combined, null, 2));

console.log('Appended successfully');
