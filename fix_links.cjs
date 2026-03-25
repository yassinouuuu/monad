const fs = require('fs');

const appPath = 'c:\\Users\\Micro-Tech\\Desktop\\3\\src\\App.jsx';
let appContent = fs.readFileSync(appPath, 'utf8');

// 1. Fix PriceTicker component to add the fallback
appContent = appContent.replace(
  /href=\{coin\.tradingUrl\}/g,
  "href={coin.tradingUrl || (color === 'emerald' ? `https://nad.fun/coin/${coin.address}` : `https://something.tools/token/${coin.address}`)}"
);

// 2. Rotate cache keys by applying _2
appContent = appContent.replace(/monad_vFINAL_/g, 'monad_vFINAL_2_');

fs.writeFileSync(appPath, appContent, 'utf8');

const networkPath = 'c:\\Users\\Micro-Tech\\Desktop\\3\\src\\services\\NetworkService.js';
let networkContent = fs.readFileSync(networkPath, 'utf8');

// Rotate in NetworkService
networkContent = networkContent.replace(/monad_vFINAL_/g, 'monad_vFINAL_2_');

fs.writeFileSync(networkPath, networkContent, 'utf8');

console.log('Fixed PriceTicker fallback links and rotated cache keys to vFINAL_2');
