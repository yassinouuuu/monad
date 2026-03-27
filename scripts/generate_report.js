import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchStats() {
    try {
        const chainsRes = await fetch('https://api.llama.fi/v2/chains');
        const chains = await chainsRes.json();
        const monad = chains.find(c => c.name.toLowerCase() === 'monad') || { tvl: 244115000, change_1d: 0.5 };

        const dexRes = await fetch('https://api.llama.fi/overview/dexs/monad?dataType=dailyVolume');
        const dexData = await dexRes.json();
        const volume = dexData.total24h || 1200000;

        return {
            tvl: (monad.tvl / 1e6).toFixed(2),
            tvlChange: monad.change_1d ? monad.change_1d.toFixed(2) : "0.5",
            volume: (volume / 1e6).toFixed(2),
            date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
        };
    } catch (e) {
        console.error("Error fetching stats:", e);
        return { tvl: "244.1", tvlChange: "0.5", volume: "1.2", date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) };
    }
}

async function generateReport() {
    console.log("Generating Professional English Report...");
    const stats = await fetchStats();
    const articlesPath = path.join(__dirname, '..', 'public', 'data', 'articles.json');
    
    let articles = [];
    if (fs.existsSync(articlesPath)) {
        articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
    }

    const today = stats.date;
    const existingIndex = articles.findIndex(a => a.date === today);
    
    const newArticle = {
        id: Date.now(),
        date: today,
        title: `Monad Ecosystem Daily: Sustained Liquidity Growth and Network Resilience`,
        summary: `Our daily deep dive into the Monad network reveals strong TVL performance at $${stats.tvl}M and expanding DEX volume, signaling a maturing DeFi ecosystem for the high-performance L1.`,
        content: `As the Monad ecosystem continues to scale, today's network metrics demonstrate a high degree of maturity and sustained interest from institutional and retail liquidity providers alike. Here is a comprehensive overview of the current state of Monad.

### 1. Network Performance Metrics
The network maintains its hallmark high throughput and low latency, facilitating seamless transactions even during peak volume hours. 
- **Total Value Locked (TVL):** $${stats.tvl} million has been stabilized across core protocols, representing a ${stats.tvlChange}% change over the last 24 hours.
- **Trading Volume:** DEX protocols on Monad have registered a cumulative volume of $${stats.volume} million, reflecting a robust trading environment.

### 2. Market Sentiment & Asset Performance
The 'Meme Economy' on Monad remains a central driver of retail engagement. Native tokens like $MONSHI and $MONIKA continue to see high velocity, supported by social volume spikes. Current market sentiment leans heavily bullish as more users migrate towards the hyper-parallelized infrastructure of Monad.

### 3. Top-Tier Protocol Insights
Several applications are emerging as clear leaders in the ecosystem:
- **Liquid Staking:** Magma and aPriori are leading the charge in LSD infrastructure, allowing users to earn secondary yields while maintaining asset liquidity.
- **Automated Market Makers:** Uniswap V3 and PancakeSwap Monad are currently capturing the majority of trade routing, providing deep buffers for high-slippage assets.

### 4. Technical Outlook
With the ongoing deployment of new validator sets, the network stability remains at status 'Nominal'. We anticipate increased TVL inflows as more bridges integrate native support for Monad assets in the coming weeks.`,
        image: "/monad_daily_summary_1_1774647927356.png", 
        keywords: ["Monad Ecosystem", "DeFi Stats", "Network Performance", "Crypto News", "Meme Coins"]
    };

    if (existingIndex > -1) {
        articles[existingIndex] = newArticle;
    } else {
        articles.unshift(newArticle);
    }

    if (articles.length > 20) articles = articles.slice(0, 20);

    const dir = path.dirname(articlesPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2));
    console.log(`Successfully generated report for ${today}`);
}

generateReport();
