const fs = require('fs');
const files = ['c:\\Users\\Micro-Tech\\Desktop\\3\\src\\App.jsx', 'c:\\Users\\Micro-Tech\\Desktop\\3\\src\\services\\NetworkService.js'];

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, i) => {
        if (/[^\x00-\x7F]/.test(line)) {
            console.log(`FILE: ${file} | LINE: ${i + 1} | CONTENT: ${line.trim()}`);
        }
    });
});
