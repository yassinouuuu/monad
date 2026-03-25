const fs = require('fs');

const appPath = 'c:\\Users\\Micro-Tech\\Desktop\\3\\src\\App.jsx';
let appContent = fs.readFileSync(appPath, 'utf8');

// Fix nad.fun/coin/ -> nad.fun/tokens/
appContent = appContent.replace(/https:\/\/nad\.fun\/coin\//g, 'https://nad.fun/tokens/');

// Rotate cache keys by applying _3
appContent = appContent.replace(/monad_vFINAL_2_/g, 'monad_vFINAL_3_');

fs.writeFileSync(appPath, appContent, 'utf8');

const networkPath = 'c:\\Users\\Micro-Tech\\Desktop\\3\\src\\services\\NetworkService.js';
let networkContent = fs.readFileSync(networkPath, 'utf8');

// Fix nad.fun/coin/ -> nad.fun/tokens/
networkContent = networkContent.replace(/https:\/\/nad\.fun\/coin\//g, 'https://nad.fun/tokens/');

// Rotate cache in NetworkService
networkContent = networkContent.replace(/monad_vFINAL_2_/g, 'monad_vFINAL_3_');

fs.writeFileSync(networkPath, networkContent, 'utf8');

console.log('Fixed nad.fun URL format to /tokens/ and rotated cache keys to vFINAL_3');
