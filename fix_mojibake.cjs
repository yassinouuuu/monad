const fs = require('fs');
const path = 'c:\\Users\\Micro-Tech\\Desktop\\3\\src\\services\\NetworkService.js';
let content = fs.readFileSync(path, 'utf8');

// Fix Mojibake in NetworkService.js
content = content.replace(/Ã¢â€“Â²/g, '+')
                 .replace(/Ã¢â€“Â¼/g, '-')
                 .replace(/Ã¢â‚¬â„¢/g, "'")
                 .replace(/Ã‚Â±/g, '+/-');

// Fix broken Arabic comments (approximate fix or just convert to English to be safe, but let's try to restore if possible)
// Better to just clean up the noise if I can't restore accurately.
// Looking at the context:
// 988: // للتفعيل: ضع API Key من ...
// 991: // ← المفتاح الخاص بك ...
// 1013: // إذا كان API Key متوفراً ...
// 1080: // --- Fallback: بيانات حقيقية بدون API Key ---

content = content.replace(/\/\/ Ã™â€žÃ™â€žÃ˜ÂªÃ™Â Ã˜Â¹Ã™Å Ã™â€ž: Ã˜Â¶Ã˜Â¹ API Key/g, '// To activate: Put API Key')
                 .replace(/\/\/ Ã¢â€ Â  Ã˜Â§Ã™â€žÃ™â€¦Ã™Â Ã˜ÂªÃ˜Â§Ã˜Â­ Ã˜Â§Ã™â€žÃ˜Â®Ã˜Â§Ã˜Âµ Ã˜Â¨Ã™Æ’/g, '// Your private key')
                 .replace(/\/\/ Ã˜Â§Ã™â€žÃ™Æ’Ã™Ë†Ã™â€žÃ™Å Ã™Æ’Ã˜Â´Ã™â€ Ã˜Â² Ã˜Â§Ã™â€žÃ˜Â­Ã™â€šÃ™Å Ã™â€šÃ™Å Ã˜Â©/g, '// Real collections')
                 .replace(/\/\/ Ã˜Â¥Ã˜Â°Ã˜Â§ Ã™Æ’Ã˜Â§Ã™â€  API Key Ã™â€¦Ã˜ÂªÃ™Ë†Ã™Â Ã˜Â±Ã˜Â§Ã™â€¹/g, '// If API Key is available')
                 .replace(/\/\/ --- Fallback: Ã˜Â¨Ã™Å Ã˜Â§Ã™â€ Ã˜Â§Ã˜Âª Ã˜Â­Ã™â€šÃ™Å Ã™â€šÃ™Å Ã˜Â© Ã˜Â¨Ã˜Â¯Ã™Ë†Ã™â€  API Key ---/g, '// --- Fallback: Real data without API Key ---')
                 .replace(/\/\/ --- Fallback: Ã˜Â¨Ã™Å Ã˜Â§Ã™â€ Ã˜Â§Ã˜Âª Ã˜Â­Ã™â€šÃ™Å Ã™â€šÃ™Å Ã˜Â© Ã™â€¦Ã™â€  Real-time Aggregator/g, '// --- Fallback: Real data from Aggregator');

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully fixed mojibake in NetworkService.js');

// Now fix App.jsx specifically for the dot
const appPath = 'c:\\Users\\Micro-Tech\\Desktop\\3\\src\\App.jsx';
let appContent = fs.readFileSync(appPath, 'utf8');
appContent = appContent.replace(/'· '/g, "'.' "); // Replace the middle dot with a standard dot
fs.writeFileSync(appPath, appContent, 'utf8');
console.log('Successfully fixed App.jsx dot symbol.');
