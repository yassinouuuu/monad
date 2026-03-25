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
import MemeAgentDemo from './MemeAgentDemo';
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
    // For coins we just store the array directly, for stats it was a processed object
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
      <a key={i} href={coin.tradingUrl} target="_blank" rel="noopener noreferrer" className="ticker-item gap-3 border-r border-white/5 h-full hover:bg-white/5 transition-colors cursor-pointer no-underline">
        {coin.logoUrl && <img src={coin.logoUrl} className="w-5 h-5 rounded-md" alt="" />}
        <span className="text-[11px] font-black text-white/40 uppercase">{coin.symbol}</span>
        <span className={`text-[11px] font-black tracking-widest ${color === 'purple' ? 'text-monad-purple' : ''}`}>{coin.displayPrice}</span>
        <span className={`text-[10px] font-black ${parseFloat(coin.displayChange1h) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {parseFloat(coin.displayChange1h) >= 0 ? '+' : ''}{coin.displayChange1h}
        </span>
      </a>
    ))}
  </div>
));

const CoinItem = React.memo(({ coin, index, type, isLatest = false }) => {
  const isNad = type === 'nad';
  const colorClass = isNad ? 'monad-purple' : 'orange-400';
  const tradeLink = coin.tradingUrl || (isNad ? `https://nad.fun/coin/${coin.address}` : `https://something.tools/token/${coin.address}`);
  
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
        <img src={coin.logoUrl} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.src = 'https://monadstats/logo.png'; }} />
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
      <a href={tradeLink} target="_blank" rel="noopener noreferrer" className={`ml-4 p-3 bg-${isNad ? 'monad-purple' : 'orange-400'}/10 text-${isNad ? 'monad-purple' : 'orange-400'} rounded-xl hover:bg-${isNad ? 'monad-purple' : 'orange-400'} hover:text-white transition-all shadow-xl shadow-black/40`}>
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
        <img src={collection.image} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.src = 'https://monadstats.vercel.app/logo.svg'; }} />
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
      <div className="flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${collection.changeColor || 'text-white/40'} bg-white/5`}>
            {collection.displayChange || '0%'}
          </span>
          <div className="flex items-baseline gap-1.5">
             <span className="text-[9px] font-black text-white/30 tracking-[0.2em] uppercase">Floor</span>
             <span className="text-base font-black text-white tracking-widest">{collection.displayFloor}</span>
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
           <span className="text-[9px] font-black text-monad-purple/50 tracking-[0.2em] uppercase">24H Vol</span>
           <span className="text-xs font-black text-monad-purple tracking-widest">{collection.displayVolume}</span>
        </div>
      </div>
      <a href={`https://monadexplorer.com/collection/${collection.address || collection.name.toLowerCase().replace(/ /g, '-')}`} target="_blank" rel="noopener noreferrer" className="ml-4 p-3 bg-monad-purple/10 text-monad-purple rounded-xl hover:bg-monad-purple hover:text-white transition-all shadow-xl shadow-black/40">
        <ExternalLink size={16} />
      </a>
    </div>
  );
});

const App = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [isEconomyOpen, setIsEconomyOpen] = useState(false);
  
  const handlePageChange = (page) => {
    setIsEconomyOpen(false);
    if (page === 'aimemes') {
      window.location.href = '/AIMEMES';
      return;
    }
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const [stats, setStats] = useState(() => initFromLS('monad_vFINAL_stats_cache', {
    tps: '---',
    avgBlockTime: '---',
    latestBlock: '---',
    gasPrice: '---',
    tvl: '$ ---',
    tvlChange: '---',
    volume: '$ ---',
    volumeChange: '---',
    activeWallets: '---',
    activeWalletsChange: '---',
    totalTx: '---',
    dailyTx: '---',
    totalAccounts: '---'
  }));
  
  const [nadFunCoins, setNadFunCoins] = useState(() => initFromLS('monad_vFINAL_nadfun_cache', []));
  const [smtCoins, setSmtCoins] = useState(() => initFromLS('monad_vFINAL_smt_cache', []));
  const [latestNadFun, setLatestNadFun] = useState(() => initFromLS('monad_vFINAL_lnad_cache', []));
  const [latestSmt, setLatestSmt] = useState(() => initFromLS('monad_vFINAL_lsmt_cache_v2', []));
  const [nftCollections, setNftCollections] = useState(() => initFromLS('monad_vFINAL_nft_cache_v3', []));
  const [news, setNews] = useState(() => initFromLS('monad_vFINAL_news_cache', []));
  const [topProtocols, setTopProtocols] = useState(() => initFromLS('monad_vFINAL_protocols_cache', []));
  const [volProtocols, setVolProtocols] = useState(() => initFromLS('monad_vFINAL_vol_protocols_cache', []));
  const [feesProtocols, setFeesProtocols] = useState(() => initFromLS('monad_vFINAL_fees_protocols_cache', []));
  const [revProtocols, setRevProtocols] = useState(() => initFromLS('monad_vFINAL_rev_protocols_cache', []));
  const [coinStats, setCoinStats] = useState(() => initFromLS('monad_vFINAL_coin_cache', {
     displayPrice: '$0.0225', displayMcap: '$244.1M', displayChange: '+0.00%', changeColor: 'text-emerald-400'
  }));

  useEffect(() => {
    let isMounted = true;

    const fetchLiveStats = async () => {
      const liveStats = await NetworkService.getLiveStats();
      if (liveStats && isMounted) {
        setStats(prev => ({ ...prev, ...liveStats }));
      }
    };

    const fetchEcosystemData = async () => {
      try {
        const [nad, smt, lNad, lSmt, nft, newsData, protocolsData, vol, fees, rev, coin] = await Promise.all([
          NetworkService.getNadFunCoins(30),
          NetworkService.getSomethingToolsCoins(30),
          NetworkService.getLatestNadFunCoins(30),
          NetworkService.getLatestSomethingToolsCoins(30),
          NetworkService.getMonadNFTs(),
          NetworkService.getMonadNews(),
          NetworkService.getTopProtocols(),
          NetworkService.getTopProtocolsByVolume(),
          NetworkService.getTopProtocolsByFees(),
          NetworkService.getTopProtocolsByRevenue(),
          NetworkService.getMonadCoinStats()
        ]);
        
        if (isMounted) {
          if (nad) { setNadFunCoins(nad); localStorage.setItem('monad_v4_nadfun_cache', JSON.stringify(nad)); }
          if (smt) { setSmtCoins(smt); localStorage.setItem('monad_v4_smt_cache', JSON.stringify(smt)); }
          if (lNad) { setLatestNadFun(lNad); localStorage.setItem('monad_v4_lnad_cache', JSON.stringify(lNad)); }
          if (lSmt) { setLatestSmt(lSmt); localStorage.setItem('monad_v4_lsmt_cache_v2', JSON.stringify(lSmt)); }
          if (nft) { setNftCollections(nft); localStorage.setItem('monad_v4_nft_cache_v3', JSON.stringify(nft)); }
          if (newsData) { setNews(newsData); localStorage.setItem('monad_v4_news_cache', JSON.stringify(newsData)); }
          if (protocolsData && protocolsData.length > 0) { setTopProtocols(protocolsData); localStorage.setItem('monad_v4_protocols_cache', JSON.stringify(protocolsData)); }
          if (vol) { setVolProtocols(vol); localStorage.setItem('monad_v4_vol_protocols_cache', JSON.stringify(vol)); }
          if (fees) { setFeesProtocols(fees); localStorage.setItem('monad_v4_fees_protocols_cache', JSON.stringify(fees)); }
          if (rev) { setRevProtocols(rev); localStorage.setItem('monad_v4_rev_protocols_cache', JSON.stringify(rev)); }
          if (coin) { setCoinStats(coin); localStorage.setItem('monad_v4_coin_cache', JSON.stringify(coin)); }
        }
      } catch (err) {
        console.error("Critical Ecosystem Fetch Error:", err);
      }
    };

    fetchLiveStats();
    fetchEcosystemData();

    const livePulseInterval = setInterval(fetchLiveStats, 2000);
    const ecosystemInterval = setInterval(fetchEcosystemData, 3600000);

    return () => {
      isMounted = false;
      clearInterval(livePulseInterval);
      clearInterval(ecosystemInterval);
    };
  }, []);

  return (
    <div className="bg-[#0b0b0f] text-white selection:bg-monad-purple/30 selection:text-white">
      
      {/* --- TOP FIXED HEADER --- */}
      <header className="main-header" style={{ overflow: 'visible', zIndex: 1000 }}>
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-monad-purple rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 rotate-3 transform hover:rotate-0 transition-all">
             <Zap size={20} className="fill-white" />
           </div>
           <div className="hidden sm:flex flex-col select-none">
             <span className="text-lg font-black tracking-tight italic uppercase leading-none">MonadStats</span>
             <span className="text-[8px] font-black text-monad-purple uppercase tracking-[0.3em] mt-1 opacity-60">Live Terminal</span>
           </div>
        </div>

        <div className="nav-segment">
           <button 
             onClick={() => handlePageChange('dashboard')}
             className={`nav-btn ${activePage === 'dashboard' ? 'active' : ''}`}
           >
             Dashboard
           </button>
           <button 
             onClick={() => handlePageChange('memes')}
             className={`nav-btn ${activePage === 'memes' ? 'active' : ''}`}
           >
             Memes
           </button>
           <button 
             onClick={() => handlePageChange('nft')}
             className={`nav-btn ${activePage === 'nft' ? 'active' : ''}`}
           >
             NFTs
           </button>
           <button 
             onClick={() => handlePageChange('protocols')}
             className={`nav-btn ${activePage === 'protocols' ? 'active' : ''}`}
           >
             DeFi
           </button>
            <button 
              onClick={() => handlePageChange('aimemes')}
              className={`nav-btn font-black text-monad-purple`}
            >
              AI Terminal
            </button>
           
           
           <div className="relative group" onMouseEnter={() => setIsEconomyOpen(true)} onMouseLeave={() => setIsEconomyOpen(false)}>
             <button 
               className={`nav-btn flex items-center gap-2 ${['volume', 'fees', 'revenue'].includes(activePage) ? 'active' : ''}`}
             >
               Analytics <ChevronDown size={12} className={`transition-all duration-300 ${isEconomyOpen ? 'rotate-180' : ''}`} />
             </button>
             
             <div className="absolute top-[40px] left-1/2 -translate-x-1/2 w-64 pt-4 hidden group-hover:block z-[9999] animate-in fade-in zoom-in-95 duration-200">
               <div className="bg-[#0b0c14]/90 border border-white/10 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden backdrop-blur-3xl p-1.5">
                 
                 <div className="px-5 py-4 border-b border-white/5 mb-1.5 bg-gradient-to-r from-monad-purple/10 to-transparent rounded-t-xl">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-monad-purple/10 rounded-lg">
                        <Activity size={14} className="text-monad-purple" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Economics</span>
                        <span className="text-[8px] font-bold text-white/30 uppercase mt-1">Live Metrics</span>
                      </div>
                   </div>
                 </div>

                 <div className="flex flex-col gap-1">
                   <button 
                     onClick={() => handlePageChange('volume')} 
                     className="group/item relative w-full text-left px-4 py-3 text-[11px] font-black uppercase text-white/60 hover:text-white hover:bg-white/[0.03] rounded-xl transition-all flex items-center justify-between"
                   >
                     <div className="flex items-center gap-3">
                       <BarChart3 size={14} className="text-white/20 group-hover/item:text-monad-purple transition-colors" />
                       Daily Volume
                     </div>
                     <ChevronRight size={12} className="opacity-0 group-hover/item:opacity-40 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
                   </button>

                   <button 
                     onClick={() => handlePageChange('fees')} 
                     className="group/item relative w-full text-left px-4 py-3 text-[11px] font-black uppercase text-white/60 hover:text-white hover:bg-white/[0.03] rounded-xl transition-all flex items-center justify-between"
                   >
                     <div className="flex items-center gap-3">
                       <Coins size={14} className="text-white/20 group-hover/item:text-monad-purple transition-colors" />
                       Network Fees
                     </div>
                     <ChevronRight size={12} className="opacity-0 group-hover/item:opacity-40 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
                   </button>

                   <button 
                     onClick={() => handlePageChange('revenue')} 
                     className="group/item relative w-full text-left px-4 py-3 text-[11px] font-black uppercase text-white/60 hover:text-white hover:bg-white/[0.03] rounded-xl transition-all flex items-center justify-between"
                   >
                     <div className="flex items-center gap-3">
                       <TrendingUp size={14} className="text-white/20 group-hover/item:text-monad-purple transition-colors" />
                       Protocol Revenue
                     </div>
                     <ChevronRight size={12} className="opacity-0 group-hover/item:opacity-40 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
                   </button>
                 </div>

                 <div className="mt-1.5 p-3 bg-white/5 rounded-b-xl border-t border-white/5">
                    <div className="flex items-center justify-between opacity-40">
                       <span className="text-[8px] font-black uppercase">Live Updates</span>
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>
                 </div>

               </div>
             </div>
           </div>
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
           <div className="w-[1px] h-4 bg-white/10"></div>
           <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none">Status</span>
              <span className="text-xs font-black text-white mt-1 uppercase">Nominal</span>
           </div>
           
           
        </div>

      </header>

      {/* --- CONTENT AREA --- */}
      <main className="content-padding pb-24 px-4 md:px-10 max-w-[1750px] mx-auto w-full">

        {/* --- TICKERS AREA (Positioned below fixed header) --- */}
         <div className="relative md:fixed md:top-[90px] w-full left-0 right-0 z-[50] flex flex-col pointer-events-none mb-6 md:mb-0">
           {/* News Ticker */}
           <div className="news-bar pointer-events-auto flex items-center">
              <div className="bg-white/10 px-6 h-full flex items-center border-r border-white/5 whitespace-nowrap">
                 <span className="text-[10px] font-black tracking-[0.3em] text-white">BREAKING NEWS</span>
              </div>
              <div className="ticker-container px-4 flex items-center gap-6 h-full flex-1">
                 <NewsTicker news={news} />
              </div>
           </div>
           
           {/* Price Bar 1 (monadstats assets) */}
           <div className="price-bar bg-black/40 backdrop-blur-md pointer-events-auto border-b border-white/5 flex items-center">
              <div className="bg-emerald-400/10 px-6 h-full flex items-center border-r border-white/5 whitespace-nowrap">
                 <span className="text-[10px] font-black tracking-[0.3em] text-emerald-400">MONAD ECOSYSTEM</span>
              </div>
              <div className="ticker-container h-full flex-1">
                 <PriceTicker coins={nadFunCoins} direction="right" color="emerald" />
              </div>
           </div>

           {/* Price Bar 2 (Something assets) */}
           <div className="price-bar bg-black/60 backdrop-blur-xl pointer-events-auto border-b border-white/10 shadow-2xl flex items-center">
              <div className="bg-monad-purple/10 px-6 h-full flex items-center border-r border-white/10 whitespace-nowrap">
                 <span className="text-[10px] font-black tracking-[0.3em] text-monad-purple">ECOSYSTEM FEED</span>
              </div>
              <div className="ticker-container h-full flex-1">
                 <PriceTicker coins={smtCoins} direction="left" color="purple" />
              </div>
           </div>
        </div>
        
        {activePage === 'dashboard' && (
          <div className="animate-slide-up">
            
            {/* KPI Executive Summary - Premium Layer */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 relative z-10 transition-all">
                {[
                  { title: 'Monad (MON)', value: coinStats.displayPrice, change: coinStats.displayChange, icon: <Activity size={18} strokeWidth={2.5} />, color: 'purple', highlight: true },
                  { title: 'Market Cap', value: coinStats.displayMcap, change: 'Native Token', icon: <Database size={18} strokeWidth={2.5} />, color: 'emerald' },
                  { title: 'Total Value Locked', value: stats.tvl, change: stats.tvlChange, icon: <Box size={18} strokeWidth={2.5} />, color: 'blue' },
                  { title: '24h DEX Volume', value: stats.volume, change: stats.volumeChange, icon: <PieChart size={18} strokeWidth={2.5} />, color: 'purple' },
                  { title: 'Daily Transactions', value: stats.dailyTx, change: 'ON-CHAIN METRIC', icon: <Zap size={18} strokeWidth={2.5} />, color: 'emerald', highlight: true, tick: true },
                  { title: 'Network Tx (Total)', value: stats.totalTx, change: 'Aggregate Data', icon: <Globe size={18} strokeWidth={2.5} />, color: 'gray' },
                  { title: 'Total Addresses', value: stats.totalAccounts, change: 'Identity Layer', icon: <Users size={18} strokeWidth={2.5} />, color: 'blue' },
                  { title: 'Active Network Pulse', value: stats.dailyActiveAccounts || '---', change: 'LIVE SEC', icon: <TrendingUp size={18} strokeWidth={2.5} />, color: 'purple', tick: true }
                ].map((kpi, i) => {
                  let badgeColor = 'bg-white/5 text-white/40 border-white/5';
                  let gradientClass = 'text-gradient-premium';
                  let glowClass = '';
                  
                  if (kpi.color === 'purple') {
                    badgeColor = 'bg-monad-purple/10 text-monad-purple border-monad-purple/20';
                    gradientClass = 'text-gradient-purple';
                    glowClass = kpi.highlight ? 'ring-1 ring-monad-purple/40 shadow-[0_0_20px_rgba(131,110,249,0.15)]' : '';
                  } else if (kpi.color === 'emerald') {
                    badgeColor = 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
                    gradientClass = 'text-gradient-emerald';
                    glowClass = kpi.highlight ? 'ring-1 ring-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : '';
                  } else if (kpi.color === 'blue') {
                    badgeColor = 'bg-blue-400/10 text-blue-400 border-blue-400/20';
                  }

                  return (
                    <div key={i} className={`premium-stat-card p-5 md:p-6 flex flex-col justify-between min-h-[160px] md:min-h-[180px] ${glowClass}`}>
                      <div className="flex items-center justify-between mb-4 relative z-10 w-full">
                        <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] text-white/50">{kpi.title}</span>
                        <div className={`h-10 w-10 flex-shrink-0 rounded-xl flex items-center justify-center border backdrop-blur-md ${badgeColor}`}>
                          {kpi.icon}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1.5 relative z-10 w-full mt-auto">
                        <div className="flex items-end gap-3 flex-wrap">
                          <span className={`font-outfit text-3xl xl:text-4xl font-black tracking-tight leading-none ${gradientClass}`}>{kpi.value}</span>
                          {kpi.tick && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-[pulse_1.5s_ease-in-out_infinite] mb-1.5 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`font-outfit text-[11px] font-bold tracking-[0.1em] uppercase ${kpi.change && kpi.change.includes('+') ? 'text-emerald-400' : kpi.change && kpi.change.includes('-') ? 'text-red-400' : 'text-white/30'}`}>
                            {kpi.change || '---'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Additional Ecosystem Metrics - Premium UI */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-5 mb-20 relative z-10 transition-all">
                {[
                  { title: 'Stablecoins MCAP', value: stats.stablecoinMC, change: '+0.02% LIVE', icon: <Coins size={16} />, color: 'emerald', tick: true },
                  { title: '24h Network Fees', value: stats.fees24h, change: stats.feesChange, icon: <Database size={16} />, color: 'purple' },
                  { title: '7d DEX Volume', value: stats.volume7d, change: '7-Day Aggregate', icon: <BarChart3 size={16} />, color: 'gray' },
                  { title: 'Protocol Yield', value: stats.topYield, change: '+0.1% TICK', icon: <TrendingUp size={16} />, color: 'emerald', tick: true },
                  { title: 'Total Protocols', value: stats.protocolsCount, change: 'Total Count', icon: <Users size={16} />, color: 'blue' },
                  { title: 'Net Inflow', value: stats.netInflow, change: '+0.05% UPD', icon: <Activity size={16} />, color: 'purple', tick: true }
                ].map((kpi, i) => {
                  let badgeColor = 'bg-white/5 text-white/40 border-white/5';
                  let gradientClass = 'text-white/70';
                  
                  if (kpi.color === 'purple') {
                    badgeColor = 'bg-monad-purple/5 text-monad-purple/70 border-monad-purple/10';
                    gradientClass = 'text-purple-100';
                  } else if (kpi.color === 'emerald') {
                    badgeColor = 'bg-emerald-400/5 text-emerald-400/70 border-emerald-400/10';
                    gradientClass = 'text-emerald-100';
                  }

                  return (
                    <div key={i} className={`premium-stat-card p-5 md:p-6 flex flex-col justify-between min-h-[140px] opacity-80 hover:opacity-100`}>
                      <div className="flex items-center justify-between mb-4 relative z-10 w-full">
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/40">{kpi.title}</span>
                        <div className={`h-8 w-8 rounded-lg flex-shrink-0 flex items-center justify-center opacity-60 group-hover:opacity-100 border backdrop-blur-sm ${badgeColor}`}>
                           {kpi.icon}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 mt-auto relative z-10 w-full">
                         <div className="flex items-end gap-2 flex-wrap">
                            <span className={`font-outfit text-2xl font-black tracking-tight leading-none ${gradientClass}`}>{kpi.value}</span>
                            {kpi.tick && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[pulse_1.5s_ease-in-out_infinite] mb-1.5 inline-block"></span>}
                         </div>
                        <span className="font-outfit text-[10px] font-bold tracking-[0.1em] uppercase text-white/30 mt-1">
                          {kpi.change || '---'}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Ecosystem spotlight and feeds */}
            <div className="mb-20">
               <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 mb-10">
                  <div className="flex flex-col">
                     <h3 className="text-2xl md:text-3xl font-black italic uppercase text-white tracking-widest">Ecosystem Spotlight</h3>
                     <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em] mt-2">Institutional Liquidity Monitoring</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase text-white/20 tracking-widest bg-white/5 py-2.5 px-5 rounded-xl border border-white/5">
                     <Clock size={14} />
                     Auto-Refresh: Active 10S
                  </div>
               </div>
               
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                  <div className="glass-card overflow-hidden border-monad-purple/20 bg-monad-purple/[0.02]">
                     <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-monad-purple/10 text-monad-purple rounded-2xl">
                              <Activity size={20} />
                           </div>
                           <h4 className="text-xl font-black uppercase tracking-tight italic">Ecosystem Market</h4>
                        </div>
                        <span className="text-[10px] font-black text-monad-purple tracking-widest leading-none">BY MARKET CAP</span>
                     </div>
                     <div className="feed-container p-4 flex flex-col gap-2">
                        {nadFunCoins.slice(0, 15).map((coin, i) => (
                           <CoinItem key={coin.address || i} coin={coin} index={i} type="nad" />
                        ))}
                     </div>
                  </div>

                  <div className="glass-card overflow-hidden border-orange-400/20 bg-orange-400/[0.02]">
                     <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-orange-400/10 text-orange-400 rounded-2xl">
                              <Coins size={20} />
                           </div>
                           <h4 className="text-xl font-black uppercase tracking-tight italic">Secondary Liquidity</h4>
                        </div>
                        <span className="text-[10px] font-black text-orange-400 tracking-widest leading-none">LIVE FEED</span>
                     </div>
                     <div className="feed-container p-4 flex flex-col gap-2">
                        {smtCoins.slice(0, 15).map((coin, i) => (
                           <CoinItem key={coin.address || i} coin={coin} index={i} type="smt" />
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activePage === 'memes' && (
          <div className="animate-slide-up">
             <div className="flex flex-col gap-4 mb-16">
                <div className="flex items-center gap-3 w-fit bg-monad-purple/5 px-4 py-2 rounded-full border border-monad-purple/20">
                   <div className="h-2 w-2 rounded-full bg-monad-purple animate-pulse"></div>
                   <span className="text-[10px] font-black text-monad-purple tracking-[0.2em] uppercase">Liquidity Stream Active</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">Meme Ecosystem Hub</h2>
                <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em] mt-4">Real-time Creation Pipeline  Verified Liquidity</p>
             </div>
             
             {/* Platform 1: monadstats */}
             <div className="mb-24">
                <div className="flex items-center gap-4 mb-10">
                   <img src="https://monadstats/logo.png" className="w-8 h-8 rounded-lg" alt="" onError={(e) => e.target.style.display='none'} />
                   <h3 className="text-3xl font-black italic uppercase text-monad-purple">Primary Ecosystem</h3>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                   {/* Top 30 monadstats */}
                   <div className="glass-card p-8 bg-monad-purple/[0.02] border-monad-purple/10">
                      <div className="flex items-center justify-between mb-8">
                         <div className="flex items-center gap-4 uppercase font-black italic text-monad-purple tracking-widest text-sm">
                             <Activity size={18} />
                            Top 30 by Market Cap
                         </div>
                         <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em]">Ecosystem Rank</span>
                      </div>
                      <div className="flex flex-col gap-3 feed-container h-[700px]">
                         {nadFunCoins.map((coin, i) => (
                           <CoinItem key={coin.address || i} coin={coin} index={i} type="nad" showPriceChange={true} />
                         ))}
                      </div>
                   </div>

                   {/* Latest monadstats */}
                   <div className="glass-card p-8 bg-white/[0.01] border-white/5">
                      <div className="flex items-center justify-between mb-8">
                         <div className="flex items-center gap-4 uppercase font-black italic text-white/40 tracking-widest text-sm">
                            <Zap size={18} />
                            Latest Creations
                         </div>
                         <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em]">Real-time Feed</span>
                      </div>
                      <div className="flex flex-col gap-3 feed-container h-[700px]">
                         {latestNadFun.map((coin, i) => (
                           <CoinItem key={coin.address || i} coin={coin} type="nad" isLatest={true} />
                         ))}
                      </div>
                   </div>
                </div>
             </div>

             {/* Platform 2: monadstats */}
             <div className="mb-24">
                <div className="flex items-center gap-4 mb-10">
                   <div className="w-8 h-8 rounded-lg bg-orange-400"></div>
                   <h3 className="text-3xl font-black italic uppercase text-orange-400">Secondary Ecosystem</h3>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                   {/* Top 30 SMT */}
                   <div className="glass-card p-8 bg-orange-400/[0.02] border-orange-400/10">
                      <div className="flex items-center justify-between mb-8">
                         <div className="flex items-center gap-4 uppercase font-black italic text-orange-400 tracking-widest text-sm">
                            <Coins size={18} />
                            Top 30 by MCAP
                         </div>
                         <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em]">Ecosystem Leaders</span>
                      </div>
                      <div className="flex flex-col gap-3 feed-container h-[700px]">
                         {smtCoins.map((coin, i) => (
                           <CoinItem key={coin.address || i} coin={coin} index={i} type="smt" />
                         ))}
                      </div>
                   </div>

                   {/* Latest SMT */}
                   <div className="glass-card p-8 bg-white/[0.01] border-white/5">
                      <div className="flex items-center justify-between mb-8">
                         <div className="flex items-center gap-4 uppercase font-black italic text-white/40 tracking-widest text-sm">
                            <RefreshCw size={18} />
                            New Drops
                         </div>
                         <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em]">Streaming Feed</span>
                      </div>
                      <div className="flex flex-col gap-3 feed-container h-[700px]">
                         {latestSmt.map((coin, i) => (
                           <CoinItem key={coin.address || i} coin={coin} type="smt" isLatest={true} />
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

         {activePage === 'nft' && (
          <div className="animate-slide-up">
             <div className="flex flex-col gap-4 mb-16">
                <div className="flex items-center gap-3 w-fit bg-monad-purple/5 px-4 py-2 rounded-full border border-monad-purple/20">
                   <div className="h-2 w-2 rounded-full bg-monad-purple animate-pulse"></div>
                   <span className="text-[10px] font-black text-monad-purple tracking-[0.2em] uppercase">NFT Liquidity Active</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">NFT Ecosystem Hub</h2>
                <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em] mt-4">Top Monad Collections  Real-time Floor & Volume</p>
             </div>
             
             <div className="glass-card p-10 bg-monad-purple/[0.02] border-monad-purple/10">
                <div className="flex items-center justify-between mb-10">
                   <div className="flex items-center gap-4 uppercase font-black italic text-monad-purple tracking-widest text-base">
                      <Image size={24} />
                      Top 20 Monad Collections by Volume
                   </div>
                   <div className="flex items-center gap-10">
                      <div className="flex flex-col items-end">
                         <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Network</span>
                         <span className="text-xs font-black text-white px-3 py-1 bg-white/5 rounded-lg mt-1">MONAD MAINNET</span>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Aggregator</span>
                         <span className="text-xs font-black text-monad-purple px-3 py-1 bg-monad-purple/10 rounded-lg mt-1">AGGREGATED DATA</span>
                      </div>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                   {nftCollections.map((col, i) => (
                      <NFTItem key={col.address || i} collection={col} index={i} />
                   ))}
                </div>
             </div>
          </div>
        )}

        {activePage === 'volume' && (
          <div className="animate-slide-up">
             <div className="flex flex-col gap-4 mb-16">
                <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">Volume Rankings</h2>
                <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em] mt-4">Top Monad Ecosystem Apps by 24h Trading Volume</p>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 mb-20">
                 {volProtocols.map((p, i) => (
                   <div key={i} className="glass-card flex items-center justify-between p-6 border-white/5 bg-gradient-to-r from-monad-purple/[0.02] to-transparent">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-black">
                           <img src={p.logo} alt="" className="w-full h-full rounded-2xl" />
                        </div>
                        <div className="flex flex-col">
                           <a href={p.url} target="_blank" className="text-2xl font-black text-white italic uppercase">{p.name}</a>
                           <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{p.category}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="text-2xl font-black text-monad-purple tracking-tighter">{p.displayValue}</span>
                         <span className={`text-xs font-black ${p.changeColor}`}>{p.displayChange}</span>
                      </div>
                   </div>
                 ))}
             </div>
          </div>
        )}

        {activePage === 'fees' && (
          <div className="animate-slide-up">
             <div className="flex flex-col gap-4 mb-16">
                <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">Fees Rankings</h2>
                <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em] mt-4">Protocols Generating Highest Daily Fees on Monad</p>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 mb-20">
                 {feesProtocols.map((p, i) => (
                   <div key={i} className="glass-card flex items-center justify-between p-6 border-white/5 bg-gradient-to-r from-emerald-500/[0.02] to-transparent">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-black">
                           <img src={p.logo} alt="" className="w-full h-full rounded-2xl" />
                        </div>
                        <div className="flex flex-col">
                           <a href={p.url} target="_blank" className="text-2xl font-black text-white italic uppercase">{p.name}</a>
                           <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{p.category}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="text-2xl font-black text-emerald-400 tracking-tighter">{p.displayValue}</span>
                         <span className={`text-xs font-black ${p.changeColor}`}>{p.displayChange}</span>
                      </div>
                   </div>
                 ))}
             </div>
          </div>
        )}

        {activePage === 'revenue' && (
          <div className="animate-slide-up">
             <div className="flex flex-col gap-4 mb-16">
                <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">Revenue Rankings</h2>
                <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em] mt-4">Top Revenue Generating Protocols (Protocol Earnings)</p>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 mb-20">
                 {revProtocols.map((p, i) => (
                   <div key={i} className="glass-card flex items-center justify-between p-6 border-white/5 bg-gradient-to-r from-orange-400/[0.02] to-transparent">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-black">
                           <img src={p.logo} alt="" className="w-full h-full rounded-2xl" />
                        </div>
                        <div className="flex flex-col">
                           <a href={p.url} target="_blank" className="text-2xl font-black text-white italic uppercase">{p.name}</a>
                           <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{p.category}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="text-2xl font-black text-orange-400 tracking-tighter">{p.displayValue}</span>
                         <span className={`text-xs font-black ${p.changeColor}`}>{p.displayChange}</span>
                      </div>
                   </div>
                 ))}
             </div>
          </div>
        )}

        {activePage === 'protocols' && (
          <div className="animate-slide-up">
             <div className="flex flex-col gap-4 mb-16">
                <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">DeFi Rankings</h2>
                <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em] mt-4">Top Monad Ecosystem DeFi Applications Ranked by TVL</p>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 mb-20">
                 {topProtocols.map((protocol, i) => (
                   <div key={i} className="glass-card flex items-center justify-between p-6 border-white/5 hover:border-emerald-500/20 transition-all cursor-pointer group bg-gradient-to-r from-emerald-500/[0.02] to-transparent relative overflow-hidden">
                     {/* Rank Number */}
                     <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-all font-black italic text-8xl -mt-6">
                       #{i + 1}
                     </div>
                     
                     <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-br from-white/10 to-transparent">
                          {protocol.logo ? (
                            <img src={protocol.logo} alt={protocol.name} className="w-full h-full rounded-2xl bg-black" />
                          ) : (
                            <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center text-white/20 font-black">{i + 1}</div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                           <div className="flex items-center gap-3">
                             <a href={protocol.url} target="_blank" rel="noopener noreferrer" className="text-2xl font-black text-white hover:text-emerald-400 transition-colors uppercase italic tracking-tight">{protocol.name}</a>
                             <ExternalLink size={14} className="text-white/20" />
                           </div>
                           <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{protocol.category}</span>
                        </div>
                     </div>
                     <div className="flex flex-col items-end gap-1 relative z-10">
                        <span className="text-2xl font-black text-emerald-400 tracking-tighter">{protocol.displayTvl}</span>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">1D Change</span>
                           <span className={`text-xs font-black ${protocol.changeColor} py-0.5 px-2 bg-white/5 rounded-md`}>{protocol.displayChange}</span>
                        </div>
                     </div>
                   </div>
                 ))}
             </div>
          </div>
        )}

      </main>

      <footer className="py-12 px-4 md:px-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0 text-[10px] text-white/10 font-black uppercase tracking-[0.4em] relative z-20 text-center md:text-left">
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/40"></div>
               <span>Terminal-ID: HUB-MON-ALPHA-9</span>
            </div>
            <div className="w-[1px] h-4 bg-white/10"></div>
            <span>System: Stable-Nominal-v1.2</span>
         </div>
         <div className="flex items-center gap-6">
            <span>Aggregated Chain Intelligence</span>
            <div className="w-[1px] h-4 bg-white/10"></div>
            <span className="text-white/30">MonadStats Interface &copy; 2026</span>
         </div>
      </footer>

    </div>
  );
};

export default App;


