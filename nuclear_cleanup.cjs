const fs = require('fs');

const files = [
    'c:\\Users\\Micro-Tech\\Desktop\\3\\src\\App.jsx', 
    'c:\\Users\\Micro-Tech\\Desktop\\3\\src\\services\\NetworkService.js'
];

files.forEach(file => {
    const buf = fs.readFileSync(file);
    let str = buf.toString('utf8');
    
    // Nuclear option: replace all non-ASCII with their intended ASCII or remove
    // Specifically target the mojibake patterns observed
    str = str.replace(/Ã¢â€“Â²/g, '+');
    str = str.replace(/Ã¢â€“Â¼/g, '-');
    str = str.replace(/Ã¢â‚¬â„¢/g, "'");
    str = str.replace(/Ã‚Â±/g, '+/-');
    
    // Remove ALL other non-ASCII characters to guarantee no more rendering issues
    str = str.replace(/[^\x00-\x7F]/g, '');
    
    fs.writeFileSync(file, str, 'utf-8');
    console.log(`Cleaned ${file}`);
});
