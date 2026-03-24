import React, { useState, useEffect } from 'react';
import { 
  Activity, Clock, Box, Database, Globe, RefreshCw, 
  Search, User, LayoutGrid, Coins, Image, Link, 
  BarChart3, Users, TrendingUp, MoreHorizontal, Plus,
  ChevronDown, Filter, Zap, Bell, Smile, ExternalLink,
  PieChart, Settings, LogOut, ChevronRight
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import NetworkService from './services/NetworkService';
import './index.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const getAge = (createdAt) => {
  if (!createdAt) return '---';
  const now = Math.floor(Date.now() / 1000);
  const diff = now - createdAt;
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return `${Math.floor(diff / 604800)}w`;
};

// Initialize with localStorage to eliminate the "initial load delay" for repeat users
const initFromLS = (key, defaultVal) => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultVal;
    const parsed = JSON.parse(stored);
    return parsed.processed || parsed;
  } catch (e) {
    return defaultVal;
  }
};

// --- MEMOIZED COMPONENTS FOR PERFORMANCE ---
const NewsTicker = React.memo(({ news }) => (
  <div className="ticker-content-left flex-1 items-center gap-20">
    {[...news, ...news].map((item, i) => (
      <div key={i} className="ticker-item gap-4">
        <span className="text-white/40 text-[9px] font-black">{item.date} // </span>
        <span className="truncate">{item.title}</span>
      </div>
    ))}
  </div>
));

const PriceTicker = React.memo(({ coins, direction = 'left', color = 'emerald' }) => (
  <div className={`ticker-content-${direction} flex items-center`}>
    {[...coins, ...coins].map((coin, i) => (
      <div key={i} className="ticker-item gap-3 border-r border-white/5 h-full">
        {coin.logoUrl && <img src={coin.logoUrl} className="w-5 h-5 rounded-md" alt="" />}
        <span className="text-[11px] font-black text-white/40 uppercase">{coin.symbol}</span>
        <span className={`text-[11px] font-black tracking-widest ${color === 'purple' ? 'text-monad-purple' : ''}`}>{coin.displayPrice}</span>
        <span className={`text-[10px] font-black ${color === 'purple' ? 'text-monad-purple/40' : 'text-emerald-400'}`}>
          {color === 'purple' ? '●' : (parseFloat(coin.displayChange1h) >= 0 ? '▲' : '▼')}
        </span>
      </div>
    ))}
  </div>
));

const NFTPriceTicker = React.memo(({ collections }) => {
  if (!collections || collections.length === 0) return null;
  const displayItems = [...collections, ...collections];
  
  return (
    <div className="price-bar bg-black/80 backdrop-blur-2xl pointer-events-auto border-b border-white/20 flex items-center">
      <div className="bg-purple-600/20 px-6 h-full flex items-center border-r border-white/10 whitespace-nowrap">
        <span className="text-[10px] font-black tracking-[0.3em] text-white">NFT PRICES // FLOOR</span>
      </div>
      <div className="ticker-container h-full flex-1">
        <div className="ticker-content-left flex items-center">
          {displayItems.map((col, i) => (
            <div key={i} className="ticker-item gap-3 border-r border-white/5 h-full px-8">
              <span className="text-[11px] font-black text-white/40 uppercase">{col.name}</span>
              <span className="text-[11px] font-black tracking-widest text-emerald-400">{col.displayFloor}</span>
              <span className={`text-[10px] font-black ${col.changeColor || 'text-emerald-400'}`}>
                {col.displayChange || '+0%'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

const CoinItem = React.memo(({ coin, index, type, isLatest = false }) => {
  const isNad = type === 'nad';
  const colorClass = isNad ? 'monad-purple' : 'orange-400';
  const linkBase = isNad ? 'https://nad.fun/tokens/' : 'https://something.tools/token/';
  const changeStr = coin.displayChange1h || '+0.00%';
  const changeValue = parseFloat(changeStr.replace(/[+%]/g, ''));
  const isPositive = changeValue >= 0;

  return (
    <div className="flex items-center gap-5 p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] transition-all border border-transparent hover:border-white/5 group">
      {index !== undefined && (
        <span className={`w-8 text-xl font-black italic text-white/5 group-hover:text-${isNad ? 'monad-purple' : 'orange-400'}/30 transition-colors`}>
          {(index + 1).toString().padStart(2, '0')}
        </span>
      )}
      <div className={`w-14 h-14 rounded-2xl ring-2 ring-white/5 overflow-hidden group-hover:ring-${isNad ? 'monad-purple' : 'orange-400'}/30 transition-all shadow-xl shadow-black/40`}>
        <img src={coin.logoUrl} className="w-full h-full object-cover" alt="" />
      </div>
      <div className="flex flex-col flex-1 pl-1">
        <span className="font-black text-white text-base leading-none tracking-tight">{coin.symbol}</span>
        {isLatest ? (
           <span className={`text-[9px] font-black text-${isNad ? 'monad-purple' : 'orange-400'} uppercase mt-1.5`}>{getAge(coin.createdAt)} OLD</span>
        ) : (
           <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1.5 truncate max-w-[120px]">{coin.name}</span>
        )}
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${isPositive ? 'text-emerald-400 bg-emerald-400/5' : 'text-red-400 bg-red-400/5'}`}>
            {changeStr}
          </span>
          <span className="text-base font-black text-white tracking-widest">{coin.displayPrice}</span>
        </div>
        <span className={`text-[11px] font-black text-${isNad ? 'monad-purple' : 'orange-400'} px-2 py-0.5 rounded-lg bg-${isNad ? 'monad-purple' : 'orange-400'}/5 border border-${isNad ? 'monad-purple' : 'orange-400'}/10`}>
          {coin.displayMC}
        </span>
      </div>
      <a href={`${linkBase}${coin.address}`} target="_blank" rel="noopener noreferrer" className={`ml-4 p-3 bg-${isNad ? 'monad-purple' : 'orange-400'}/10 text-${isNad ? 'monad-purple' : 'orange-400'} rounded-xl hover:bg-${isNad ? 'monad-purple' : 'orange-400'} hover:text-white transition-all shadow-xl shadow-black/40`}>
        <ExternalLink size={16} />
      </a>
    </div>
  );
});

const NFTItem = React.memo(({ collection, index }) => {
  return (
    <div className="flex items-center gap-5 p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] transition-all border border-transparent hover:border-white/5 group">
      <span className={`w-8 text-xl font-black italic text-white/5 group-hover:text-monad-purple/30 transition-colors`}>
        {(index + 1).toString().padStart(2, '0')}
      </span>
      <div className={`w-14 h-14 rounded-2xl ring-2 ring-white/5 overflow-hidden group-hover:ring-monad-purple/30 transition-all shadow-xl shadow-black/40`}>
        <img src={collection.image} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.src = 'https://opensea.io/static/images/logos/opensea.svg'; }} />
      </div>
      <div className="flex flex-col flex-1 pl-1">
        <span className="font-black text-white text-base leading-none tracking-tight">{collection.name}</span>
        <div className="flex items-center gap-2 mt-1.5 text-[9px] font-black uppercase tracking-widest text-white/30">
          <span>{collection.symbol}</span>
          <div className="w-1 h-1 rounded-full bg-white/10 mx-1"></div>
          <span>{collection.owners?.toLocaleString() || '--'} OWNS</span>
          <div className="w-1 h-1 rounded-full bg-white/10 mx-1"></div>
          <span>{collection.sales?.toLocaleString() || '--'} SALES</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${collection.changeColor || 'text-white/40'} bg-white/5`}>
            {collection.displayChange || '0%'}
          </span>
          <div className="flex items-baseline gap-1.5">
             <span className="text-[9px] font-black text-white/30 tracking-[0.2em] uppercase">Floor</span>
             <span className="text-base font-black text-white tracking-widest">{collection.displayFloor}</span>
          </div>
        </div>
      </div>
      <a href={`https://opensea.io/collection/${collection.address || collection.name.toLowerCase().replace(/ /g, '-')}`} target="_blank" rel="noopener noreferrer" className="ml-4 p-3 bg-monad-purple/10 text-monad-purple rounded-xl hover:bg-monad-purple hover:text-white transition-all shadow-xl shadow-black/40">
        <ExternalLink size={16} />
      </a>
    </div>
  );
});

const App = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [stats, setStats] = useState(() => initFromLS('monad_hub_stats_cache', {
    tps: '---',
    avgBlockTime: '---',
    latestBlock: '---',
    gasPrice: '---',
    tvl: '$ ---',
    tvlChange: '---',
    volume: '$ ---',
    volumeChange: '---',
    activeWallets: '---'
  }));
  
  const [nadFunCoins, setNadFunCoins] = useState(() => initFromLS('monad_hub_nadfun_cache', []));
  const [smtCoins, setSmtCoins] = useState(() => initFromLS('monad_hub_smt_cache', []));
  const [latestNadFun, setLatestNadFun] = useState(() => initFromLS('monad_hub_lnad_cache', []));
  const [latestSmt, setLatestSmt] = useState(() => initFromLS('monad_hub_lsmt_cache_v2', []));
  const [nftCollections, setNftCollections] = useState(() => initFromLS('monad_hub_nft_cache_v3', []));
  const [news, setNews] = useState(() => initFromLS('monad_hub_news_cache', []));
  const [topProtocols, setTopProtocols] = useState(() => initFromLS('monad_hub_protocols_cache', []));

  useEffect(() => {
    let isMounted = true;
    const fetchLiveStats = async () => {
      const liveStats = await NetworkService.getLiveStats();
      if (isMounted && liveStats) setStats(liveStats);
    };

    const fetchEcosystemData = async () => {
      try {
        const [nad, smt, lNad, lSmt, nft, newsData, protocolsData] = await Promise.all([
          NetworkService.getNadFunCoins(30),
          NetworkService.getSomethingToolsCoins(30),
          NetworkService.getLatestNadFunCoins(30),
          NetworkService.getLatestSomethingToolsCoins(30),
          NetworkService.getMonadNFTs(),
          NetworkService.getMonadNews(),
          NetworkService.getTopProtocols()
        ]);
        
        if (isMounted) {
          if (nad) { setNadFunCoins(nad); localStorage.setItem('monad_hub_nadfun_cache', JSON.stringify(nad)); }
          if (smt) { setSmtCoins(smt); localStorage.setItem('monad_hub_smt_cache', JSON.stringify(smt)); }
          if (lNad) { setLatestNadFun(lNad); localStorage.setItem('monad_hub_lnad_cache', JSON.stringify(lNad)); }
          if (lSmt) { setLatestSmt(lSmt); localStorage.setItem('monad_hub_lsmt_cache_v2', JSON.stringify(lSmt)); }
          if (nft) { setNftCollections(nft); localStorage.setItem('monad_hub_nft_cache_v3', JSON.stringify(nft)); }
          if (newsData) { setNews(newsData); localStorage.setItem('monad_hub_news_cache', JSON.stringify(newsData)); }
          if (protocolsData && protocolsData.length > 0) { setTopProtocols(protocolsData); localStorage.setItem('monad_hub_protocols_cache', JSON.stringify(protocolsData)); }
        }
      } catch (err) {
        console.error("Critical Ecosystem Fetch Error:", err);
      }
    };

    fetchLiveStats();
    fetchEcosystemData();

    const livePulseInterval = setInterval(fetchLiveStats, 2000);
    const ecosystemInterval = setInterval(fetchEcosystemData, 60000);

    return () => {
      isMounted = false;
      clearInterval(livePulseInterval);
      clearInterval(ecosystemInterval);
    };
  }, []);

  return (
    <div className="bg-[#0b0b0f] text-white selection:bg-monad-purple/30 selection:text-white">
      
      {/* --- TOP FIXED HEADER --- */}
      <header className="main-header">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-monad-purple rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 rotate-3 transform hover:rotate-0 transition-all">
             <Zap size={20} className="fill-white" />
           </div>
           <div className="hidden sm:flex flex-col select-none">
             <span className="text-lg font-black tracking-tight italic uppercase leading-none">Monad Hub</span>
             <span className="text-[8px] font-black text-monad-purple uppercase tracking-[0.3em] mt-1 opacity-60">Live Terminal</span>
           </div>
        </div>

        <div className="nav-segment">
           <button onClick={() => setActivePage('dashboard')} className={`nav-btn ${activePage === 'dashboard' ? 'active' : ''}`}>Dashboard</button>
           <button onClick={() => setActivePage('memes')} className={`nav-btn ${activePage === 'memes' ? 'active' : ''}`}>Meme Explorer</button>
           <button onClick={() => setActivePage('nft')} className={`nav-btn ${activePage === 'nft' ? 'active' : ''}`}>NFT Explorer</button>
           <button onClick={() => setActivePage('protocols')} className={`nav-btn ${activePage === 'protocols' ? 'active' : ''}`}>DeFi Rankings</button>
        </div>

        <div className="hidden lg:flex items-center gap-6 bg-white/[0.02] px-6 py-2 rounded-xl border border-white/5">
           <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none">Gas / GW</span>
              <span className="text-xs font-black text-monad-purple mt-1">{stats.gasPrice}</span>
           </div>
           <div className="w-[1px] h-4 bg-white/10"></div>
           <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none">TPS / Pulse</span>
              <span className="text-xs font-black text-emerald-400 mt-1">{stats.tps}</span>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="p-2.5 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer">
              <Search size={16} className="text-white/40" />
           </div>
           <div className="w-9 h-9 rounded-full bg-monad-purple/20 flex items-center justify-center text-monad-purple ring-1 ring-monad-purple/30">
              <User size={16} />
           </div>
        </div>
      </header>

      {/* --- TICKERS AREA --- */}
      <div className="fixed top-[90px] left-0 right-0 z-[100] flex flex-col pointer-events-none">
         <div className="news-bar pointer-events-auto flex items-center">
            <div className="bg-white/10 px-6 h-full flex items-center border-r border-white/5 whitespace-nowrap">
               <span className="text-[10px] font-black tracking-[0.3em] text-white">BREAKING NEWS</span>
            </div>
            <div className="ticker-container px-4 flex items-center gap-6 h-full flex-1">
               <NewsTicker news={news} />
            </div>
         </div>
         <NFTPriceTicker collections={nftCollections} />
      </div>

      {/* --- CONTENT AREA --- */}
      <main style={{ paddingTop: '220px' }} className="pb-24 px-10 max-w-[1750px] mx-auto w-full">
        
        {activePage === 'dashboard' && (
          <div className="animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8 relative z-10">
                {[
                  { title: 'Total Value Locked', value: stats.tvl, change: stats.tvlChange, icon: <TrendingUp size={14} />, color: 'emerald' },
                  { title: '24h DEX Volume', value: stats.volume, change: stats.volumeChange, icon: <Activity size={14} />, color: 'purple' },
                  { title: 'Daily Transactions', value: stats.dailyTx || '---', change: '● LIVE TICKET', icon: <Zap size={14} />, color: 'emerald' },
                  { title: 'Total Network Tx', value: stats.totalTx || '---', change: 'Aggregate Chain Data', icon: <Database size={14} />, color: 'white' },
                  { title: 'Total Addresses', value: stats.totalAccounts || '---', change: 'Unique Identity', icon: <Users size={14} />, color: 'white' }
                ].map((kpi, i) => (
                  <div key={i} className="glass-card p-6 flex flex-col justify-between min-h-[160px] border-white/5 hover:border-white/20 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">{kpi.title}</span>
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center bg-white/5`}>
                        {kpi.icon}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-2xl font-black tracking-tighter text-white">{kpi.value}</span>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/10">{kpi.change}</span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mt-12">
               <div className="glass-card overflow-hidden">
                  <div className="p-8 border-b border-white/5 flex items-center justify-between">
                     <h4 className="text-xl font-black uppercase italic">Nad.fun Market Leaders</h4>
                     <span className="text-[10px] font-black text-monad-purple tracking-widest">TOP BY MCAP</span>
                  </div>
                  <div className="feed-container p-4 flex flex-col gap-2 h-[500px]">
                     {nadFunCoins.slice(0, 10).map((coin, i) => (
                        <CoinItem key={coin.address || i} coin={coin} index={i} type="nad" />
                     ))}
                  </div>
               </div>
               <div className="glass-card overflow-hidden">
                  <div className="p-8 border-b border-white/5 flex items-center justify-between">
                     <h4 className="text-xl font-black uppercase italic">Something Liquidity</h4>
                     <span className="text-[10px] font-black text-orange-400 tracking-widest">LIVE FEED</span>
                  </div>
                  <div className="feed-container p-4 flex flex-col gap-2 h-[500px]">
                     {smtCoins.slice(0, 10).map((coin, i) => (
                        <CoinItem key={coin.address || i} coin={coin} index={i} type="smt" />
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {activePage === 'memes' && (
          <div className="animate-slide-up">
             <h2 className="text-6xl font-black italic uppercase tracking-tighter text-white mb-16">Meme Ecosystem Hub</h2>
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                <div className="glass-card p-8 border-monad-purple/10">
                   <h3 className="text-2xl font-black uppercase text-monad-purple mb-8">NAD.FUN Leaders</h3>
                   <div className="flex flex-col gap-3 feed-container h-[700px]">
                      {nadFunCoins.map((coin, i) => (
                        <CoinItem key={coin.address || i} coin={coin} index={i} type="nad" />
                      ))}
                   </div>
                </div>
                <div className="glass-card p-8 border-orange-400/10">
                   <h3 className="text-2xl font-black uppercase text-orange-400 mb-8">Something.tools Feed</h3>
                   <div className="flex flex-col gap-3 feed-container h-[700px]">
                      {smtCoins.map((coin, i) => (
                        <CoinItem key={coin.address || i} coin={coin} index={i} type="smt" />
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}

        {activePage === 'nft' && (
          <div className="animate-slide-up">
             <h2 className="text-6xl font-black italic uppercase tracking-tighter text-white mb-16">NFT Explorer</h2>
             <div className="glass-card p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                   {nftCollections.map((col, i) => (
                      <NFTItem key={col.address || i} collection={col} index={i} />
                   ))}
                </div>
             </div>
          </div>
        )}

        {activePage === 'protocols' && (
          <div className="animate-slide-up">
             <h2 className="text-6xl font-black italic uppercase tracking-tighter text-white mb-16">DeFi Rankings</h2>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 mb-20">
                 {topProtocols.map((protocol, i) => (
                   <div key={i} className="glass-card flex items-center justify-between p-6 border-white/5 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-5 font-black italic text-8xl -mt-6">#{i + 1}</div>
                     <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-br from-white/10 to-transparent">
                          <img src={protocol.logo} alt={protocol.name} className="w-full h-full rounded-2xl bg-black" />
                        </div>
                        <div className="flex flex-col gap-1">
                           <a href={protocol.url} target="_blank" rel="noopener noreferrer" className="text-2xl font-black text-white hover:text-emerald-400 uppercase italic tracking-tight">{protocol.name}</a>
                           <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{protocol.category}</span>
                        </div>
                     </div>
                     <div className="flex flex-col items-end gap-1 relative z-10">
                        <span className="text-2xl font-black text-emerald-400 tracking-tighter">{protocol.displayTvl}</span>
                        <span className={`text-xs font-black ${protocol.changeColor} py-0.5 px-2 bg-white/5 rounded-md`}>{protocol.displayChange}</span>
                     </div>
                   </div>
                 ))}
             </div>
          </div>
        )}

      </main>

      <footer className="py-12 px-10 border-t border-white/5 flex items-center justify-between text-[10px] text-white/10 font-black uppercase tracking-[0.4em]">
         <span>Monad Hub Interface &copy; 2026</span>
         <span>Aggregated Chain Intelligence</span>
      </footer>

    </div>
  );
};

export default App;
