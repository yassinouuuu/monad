const fs = require('fs');

const appPath = 'c:\\Users\\Micro-Tech\\Desktop\\3\\src\\App.jsx';
let content = fs.readFileSync(appPath, 'utf8');

const targetStr = `               <div className="ticker-container h-full flex-1">
                 <PriceTicker coins={smtCoins} direction="left" color="purple" />
              </div>
           </div>`;

const bannerContent = `
           {/* AI Terminal Promotional Banner */}
           <div 
              onClick={() => window.location.href='/AIMEMES'}
              className="relative bg-[#050507] backdrop-blur-3xl pointer-events-auto border-b border-monad-purple/20 flex items-center justify-center p-2.5 shadow-[0_15px_40px_rgba(131,110,249,0.1)] overflow-hidden group cursor-pointer hover:bg-black transition-colors"
           >
              {/* Dynamic light sweep effect */}
              <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-monad-purple/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
              
              <div className="flex items-center gap-4 md:gap-8 relative z-10 w-full max-w-7xl mx-auto px-4 justify-between md:justify-center">
                 
                 <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-monad-purple to-purple-800 flex items-center justify-center shadow-[0_0_15px_rgba(131,110,249,0.5)] group-hover:scale-110 transition-transform">
                       <Zap size={14} className="fill-white text-white" />
                    </div>
                    <div className="flex items-baseline gap-2">
                       <span className="text-xs md:text-sm font-black italic uppercase tracking-[0.2em] text-white">
                         Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-monad-purple to-purple-400 drop-shadow-[0_0_10px_rgba(131,110,249,0.5)]">AI Terminal v2</span>
                       </span>
                       <span className="hidden md:inline-block px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest border border-emerald-500/30">Live Now</span>
                    </div>
                 </div>
                 
                 <div className="hidden md:flex items-center gap-2 opacity-60">
                    <span className="w-1 h-1 rounded-full bg-monad-purple"></span>
                    <span className="text-[10px] font-black text-white/70 tracking-[0.3em] uppercase">Predictive On-Chain Intelligence</span>
                    <span className="w-1 h-1 rounded-full bg-monad-purple"></span>
                 </div>

                 <div className="flex items-center gap-2 bg-monad-purple/10 px-4 py-1.5 rounded-full border border-monad-purple/30 group-hover:bg-monad-purple transition-all duration-300">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white group-hover:drop-shadow-md">Launch Agent</span>
                    <ChevronRight size={14} className="text-monad-purple group-hover:text-white transform group-hover:translate-x-1 transition-all" />
                 </div>
                 
              </div>
           </div>`;

content = content.replace(targetStr, targetStr + bannerContent);

fs.writeFileSync(appPath, content, 'utf8');

const csspath = 'c:\\Users\\Micro-Tech\\Desktop\\3\\src\\index.css';
let csscontent = fs.readFileSync(csspath, 'utf8');
if (!csscontent.includes('@keyframes shimmer')) {
  csscontent += '\n@keyframes shimmer {\n  0% { transform: translateX(-100%) skewX(-12deg); }\n  100% { transform: translateX(100%) skewX(-12deg); }\n}\n';
  fs.writeFileSync(csspath, csscontent, 'utf8');
}

console.log("Successfully injected AI Terminal Banner.");
