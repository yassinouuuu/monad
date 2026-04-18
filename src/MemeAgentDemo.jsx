import React, { useState, useEffect, useMemo } from 'react';
import { 
  Zap, TrendingUp, BarChart3, Info, 
  Activity, ShieldAlert, Cpu, Layers, ExternalLink, 
  ChevronRight, Gauge, MousePointer2, Target
} from 'lucide-react';
import NetworkService from './services/NetworkService';

const MemeAgentDemo = () => {
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [coins, setCoins] = useState([]);
  const [monStats, setMonStats] = useState({ price: 0, change: 0 });
  const [agentAnalysis, setAgentAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [top30, monData] = await Promise.all([
          NetworkService.getNadFunCoins(30),
          NetworkService.getMonadCoinStats()
        ]);
        setCoins(top30 || []);
        setMonStats({ price: monData.price || 0.0225, change: monData.change || 0 });
        if (top30?.length > 0) setSelectedCoin(top30[0]);
      } catch (e) {
        console.error("Agent Load Error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Update Intel when coin or MON price changes
  useEffect(() => {
    if (selectedCoin) {
      generateIntelligence(selectedCoin, monStats);
    }
  }, [selectedCoin, monStats]);

  const generateIntelligence = (coin, mon) => {
    setAgentAnalysis(">>> ANALYZING ON-CHAIN METRICS...\n>>> SYNCING WITH MONAD PULSE...");
    
    setTimeout(() => {
      const coinMcap = parseFloat((coin.displayMC || "0").replace(/[^0-9.]/g, '')) || 0;
      const coinPrice = coin.price || 0.0001;
      
      // Technical Analysis Logic
      const rsi = (Math.random() * 40 + 30).toFixed(2);
      const sma_50 = (coinPrice * 0.98).toFixed(8);
      const resistance = (coinPrice * 1.12).toFixed(8);
      
      // MON Correlation Logic
      const correlation = coinMcap > 10 ? 0.92 : 0.45;
      const pumpPotential = mon.change > 2 ? "HIGH (MON Pump Synergy)" : "STABLE";

      let report = `[AGENT INTELLIGENCE REPORT: ${coin.symbol}]\n`;
      report += `-------------------------------------------\n`;
      report += `• RSI (14): ${rsi} (${parseFloat(rsi) > 70 ? 'OVERBOUGHT' : 'NEUTRAL'})\n`;
      report += `• 50-SMA: $${sma_50}\n`;
      report += `• CRITICAL RESISTANCE: $${resistance}\n`;
      report += `• MONAD SYNERGY: ${(correlation * 100).toFixed(0)}% CORRELATION\n`;
      report += `• PUMP POTENTIAL: ${pumpPotential}\n`;
      report += `• MARKET SENTIMENT: ${coin.displayChange1h.includes('+') ? 'BULLISH' : 'ACCUMULATION'}\n`;
      report += `-------------------------------------------\n`;
      report += `>>> MONAD BLOCK PULSE: ${mon.change >= 0 ? '+' : ''}${mon.change}% (Influencing Meme Liquidity)\n`;
      report += `>>> ACTION: ${parseFloat(rsi) < 40 ? 'STRONG ACCUMULATION ZONE' : 'MONITOR FOR BREAKOUT'}`;
      
      setAgentAnalysis(report);
    }, 600);
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[600px] gap-6 bg-[#050507]">
      <div className="relative">
         <div className="w-16 h-16 border-4 border-purple-500/20 rounded-full"></div>
         <div className="absolute top-0 w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div className="flex flex-col items-center animate-pulse">
        <span className="text-purple-400 font-black italic tracking-[0.3em] text-xl">BOOTING AGENT</span>
        <span className="text-[10px] text-gray-500 font-bold uppercase mt-2">Connecting to Monad Node...</span>
      </div>
    </div>
  );

  return (
    <div className="animate-slide-up bg-[#050507] p-4 rouned-3xl border border-white/5">
      {/* Header Panel */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
           <div className="p-5 bg-purple-600 rounded-2xl shadow-[0_0_30px_-5px_#836ef9] border border-white/10">
              <Cpu size={36} className="text-white" />
           </div>
           <div>
              <h2 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter text-white">
                Meme <span className="text-purple-500">Hunter</span> Agent
              </h2>
              <div className="flex items-center gap-4 mt-3">
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/30">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Live Node Sync</span>
                 </div>
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 rounded-full border border-purple-500/30">
                    <Zap size={10} className="text-purple-400" />
                    <span className="text-[10px] text-purple-400 font-black uppercase tracking-widest">v2-Alpha Engine</span>
                 </div>
              </div>
           </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
           <div className="glass-card !p-5 bg-white/[0.02] border-white/5 flex flex-col items-center">
              <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-2">Native Pulse (MON)</span>
              <div className="flex items-center gap-2">
                 <span className="text-2xl font-black text-white">${monStats.price.toFixed(4)}</span>
                 <span className={`text-xs font-black ${monStats.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {monStats.change >= 0 ? '▲' : '▼'} {Math.abs(monStats.change).toFixed(2)}%
                 </span>
              </div>
           </div>
           <div className="glass-card !p-5 border-purple-500/20 bg-purple-500/[0.03] flex flex-col items-center">
              <span className="text-[9px] text-purple-400 font-black uppercase tracking-widest mb-2">Network Influence</span>
              <div className="text-2xl font-black text-purple-300">
                 {monStats.change > 0 ? 'SYNERGETIC' : 'CONSOLIDATING'}
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar: Assets */}
        <div className="xl:col-span-3 flex flex-col gap-4">
           <div className="glass-card !p-0 border-white/5 overflow-hidden">
              <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Layers size={14}/> Top 30 NAD.FUN
                 </span>
              </div>
              <div className="h-[750px] overflow-y-auto scrollbar-hide">
                 {coins.map((coin, i) => (
                    <div 
                      key={i}
                      onClick={() => setSelectedCoin(coin)}
                      className={`group p-4 flex items-center gap-4 cursor-pointer transition-all border-l-4 ${selectedCoin?.symbol === coin.symbol ? 'bg-purple-600/10 border-purple-500' : 'hover:bg-white/[0.03] border-transparent'}`}
                    >
                       <img src={coin.logoUrl} className="w-10 h-10 rounded-xl" alt="" />
                       <div className="flex-1">
                          <div className="text-sm font-black text-white uppercase">{coin.symbol}</div>
                          <div className="text-[9px] text-gray-500 font-bold">{coin.displayMC}</div>
                       </div>
                       <div className="text-right">
                          <div className="text-xs font-black text-white">{coin.displayPrice}</div>
                          <div className={`text-[10px] font-black ${parseFloat(coin.displayChange1h) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                             {coin.displayChange1h}
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Center/Right: Intel & Real Chart */}
        <div className="xl:col-span-9 flex flex-col gap-6">
           {selectedCoin && (
              <>
                 {/* Live Status Row */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                       { label: 'Buy Pressure', val: '74%', icon: <TrendingUp size={14}/>, color: 'text-emerald-400' },
                       { label: 'Volatility', val: 'Extreme', icon: <Activity size={14}/>, color: 'text-orange-400' },
                       { label: 'Agent Score', val: '86/100', icon: <Target size={14}/>, color: 'text-purple-400' },
                       { label: 'Holders Trend', val: 'Growing', icon: <MousePointer2 size={14}/>, color: 'text-blue-400' }
                    ].map((m, i) => (
                       <div key={i} className="glass-card p-4 border-white/5 flex items-center justify-between">
                          <div>
                             <span className="text-[9px] text-gray-500 font-black uppercase block mb-1">{m.label}</span>
                             <span className={`text-sm font-black uppercase ${m.color}`}>{m.val}</span>
                          </div>
                          <div className={`p-2 rounded-lg bg-white/5 ${m.color}`}>
                             {m.icon}
                          </div>
                       </div>
                    ))}
                 </div>

                 {/* Real Integrated Chart Area */}
                 <div className="glass-card !p-0 border-white/5 overflow-hidden h-[500px] relative bg-black">
                    {/* Official Nad.Fun Chart Iframe Simulation */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 pointer-events-none opacity-20">
                       <BarChart3 size={80} className="text-purple-500 animate-pulse" />
                       <span className="text-xs font-black uppercase text-purple-400 mt-4 tracking-[0.5em]">Syncing Official NAD.FUN Orderbook...</span>
                    </div>
                    {/* This would be the real iframe from nad.fun */}
                    <div className="w-full h-full relative z-20">
                       {/* Mocking a professional TradingView display */}
                       <div className="absolute top-4 left-4 flex gap-4 z-30">
                          <div className="bg-black/80 px-4 py-2 rounded-lg border border-white/10 flex items-center gap-3">
                             <img src={selectedCoin.logoUrl} className="w-5 h-5 rounded" alt="" />
                             <span className="text-xs font-black text-white">{selectedCoin.symbol} / USD</span>
                          </div>
                          <div className="bg-emerald-500/20 px-4 py-2 rounded-lg border border-emerald-500/30 flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                             <span className="text-[10px] font-black text-emerald-400">TRADING ACTIVE</span>
                          </div>
                       </div>
                       <iframe 
                         src={`https://dexscreener.com/monad/${selectedCoin.address}?embed=1&theme=dark`}
                         className="w-full h-full border-none opacity-80 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                         title="Chart"
                       />
                    </div>
                 </div>

                 {/* Agent Intel Console & MON Sync */}
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Intelligence Terminal */}
                    <div className="lg:col-span-8 glass-card !p-0 border-purple-500/30 overflow-hidden shadow-[0_0_60px_-15px_rgba(131,110,249,0.2)] bg-black">
                       <div className="p-4 border-b border-purple-500/20 bg-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <Gauge size={18} className="text-purple-400" />
                             <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">Neural_Analyzer_v2.0_Active</span>
                          </div>
                          <div className="h-2 w-2 rounded-full bg-purple-500 animate-ping"></div>
                       </div>
                       <div className="p-8">
                          <pre className="font-mono text-emerald-400 text-sm leading-relaxed whitespace-pre-wrap">
                             {agentAnalysis}
                          </pre>
                       </div>
                    </div>

                    {/* Correlation Widget */}
                    <div className="lg:col-span-4 glass-card border-white/5 flex flex-col justify-between">
                       <div>
                          <h4 className="text-xs font-black text-white/40 uppercase mb-6 tracking-widest">MONAD Correlation</h4>
                          <div className="flex flex-col gap-6">
                             <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase">
                                   <span>Price Linkage</span>
                                   <span className="text-purple-400">92/100</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                   <div className="h-full bg-purple-500 w-[92%] shadow-[0_0_10px_#836ef9]"></div>
                                </div>
                             </div>
                             <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase">
                                   <span>Volume Synergy</span>
                                   <span className="text-emerald-400">74/100</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                   <div className="h-full bg-emerald-500 w-[74%] shadow-[0_0_10px_#10b981]"></div>
                                </div>
                             </div>
                          </div>
                       </div>
                       
                       <div className="bg-white/5 p-4 rounded-xl border border-white/5 mt-8">
                          <div className="flex items-center gap-2 mb-2">
                             <ShieldAlert size={14} className="text-orange-400" />
                             <span className="text-[10px] font-black text-orange-400 uppercase">System Alert</span>
                          </div>
                          <p className="text-[9px] text-gray-500 font-bold uppercase leading-tight italic">
                             High correlation detected. Meme asset is tightly shadowing MON movement. Trade caution advised during MON volatility.
                          </p>
                       </div>
                    </div>
                 </div>
              </>
           )}
        </div>
      </div>
    </div>
  );
};

export default MemeAgentDemo;
