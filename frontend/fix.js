import fs from 'fs';
import path from 'path';

const files = [
  'src/pages/ImportData.jsx',
  'src/pages/RekomendasiList.jsx',
  'src/pages/SertifikasiPersonel.jsx',
  'src/pages/WorkOrderList.jsx',
  'src/services/dashboardService.js',
  'src/context/UploadContext.jsx'
];

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Fix string interpolation bugs
    content = content.replace(/`import\.meta\.env\.VITE_API_URL\//g, '`${import.meta.env.VITE_API_URL}/');
    content = content.replace(/'import\.meta\.env\.VITE_API_URL\//g, 'import.meta.env.VITE_API_URL + \'/');
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${file}`);
  }
});

console.log("Selesai memperbaiki file!");
