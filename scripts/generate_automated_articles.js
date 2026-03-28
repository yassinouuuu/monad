import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Monad Content Engine - Version 3.0
 * 3 Articles Per Day (Midnight: Stats, 8AM/4PM: Diverse Topics)
 */

async function fetchLiveMetrics() {
    try {
        const chainsRes = await fetch('https://api.llama.fi/v2/chains');
        const chains = await chainsRes.json();
        const monad = chains.find(c => c.name.toLowerCase() === 'monad') || { tvl: 331280000, change_1d: 0.5 };

        const dexRes = await fetch('https://api.llama.fi/overview/dexs/monad?dataType=dailyVolume');
        const dexData = await dexRes.json();
        const volume = dexData.total24h || 46300000;

        let coinStats = { price: 0.0225, mcap: 244100000, change: 0.5 };
        try {
            const coinRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=monad&vs_currencies=usd&include_market_cap=true&include_24hr_change=true');
            const data = await coinRes.json();
            if (data.monad) {
                coinStats = { price: data.monad.usd, mcap: data.monad.usd_market_cap, change: data.monad.usd_24h_change };
            }
        } catch (e) {}

        return {
            tvl: (monad.tvl / 1e6).toFixed(2),
            tvlChange: monad.change_1d ? monad.change_1d.toFixed(2) : "0.5",
            volume: (volume / 1e6).toFixed(2),
            price: coinStats.price.toFixed(4),
            mcap: (coinStats.mcap / 1e6).toFixed(1),
            priceChange: coinStats.change.toFixed(2),
            date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
        };
    } catch (e) {
        return { 
            tvl: "331.2", tvlChange: "0.5", volume: "46.3", 
            price: "0.0225", mcap: "244.1", priceChange: "1.2",
            date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) 
        };
    }
}

const STATS_TEMPLATE = {
    title: "Official Monad Daily Ecosystem Report",
    summary: "A comprehensive breakdown of Monad network metrics for today, including TVL stability, DEX volume, and $MON market performance.",
    content: (m) => `### 📊 Network Health Overview
Today's network audit indicates sustained growth with the following core metrics:
- **Total Value Locked (TVL):** $${m.tvl}M (${m.tvlChange}% 24h)
- **Aggregated DEX Volume:** $${m.volume}M processed
- **$MON Market Cap:** $${m.mcap}M
- **Current Price:** $${m.price} (${m.priceChange}% 24h)

### 🏛️ Liquidity Moat
The parallel EVM execution has allowed for a sub-cent gas environment during peak volume, attracting institutional-grade liquidity providers and retail momentum.`
};

const DIVERSE_TEMPLATES = [
    {
        title: "Liquid Staking Expansion on Monad",
        summary: "The rise of protocols like Magma and aPriori is redefining capital efficiency for MON holders.",
        content: (m) => `LST protocols are becoming the backbone of the Monad DeFi economy. With a current TVL of $${m.tvl}M, users are increasingly moving towards liquid-restaking solutions to maximize capital utility while securing the network.`
    },
    {
        title: "Parallel Execution Performance Benchmarks",
        summary: "Diving into the technical edge of MonadBFT and storage layer optimizations.",
        content: (m) => `Technical benchmarks show consistent 99.9% RPC uptime. The network processed $${m.volume}M in volume today, proving that Monad's parallel architecture can handle high-density settlements without latency spikes.`
    },
    {
        title: "NFT Ecosystem Growth Ticker",
        summary: "Creative momentum on Monad is surging as unique address counts hit new quarterly highs.",
        content: (m) => `Beyond DeFi, the Monad NFT landscape is evolving into a vibrant cultural hub. Holder conviction remains high, as evidenced by stable floor prices across flagship collections linked to the network's liquidity.`
    }
];

async function generateArticle() {
    const metrics = await fetchLiveMetrics();
    const articlesPath = path.join(__dirname, '..', 'public', 'data', 'articles.json');
    const hour = new Date().getUTCHours();
    
    let articles = [];
    if (fs.existsSync(articlesPath)) {
        articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
    }

    let topic;
    if (hour === 0) {
        topic = STATS_TEMPLATE;
    } else {
        topic = DIVERSE_TEMPLATES[Math.floor(Math.random() * DIVERSE_TEMPLATES.length)];
    }

    const newArticle = {
        id: Date.now(),
        date: metrics.date,
        title: topic.title,
        summary: topic.summary,
        content: typeof topic.content === 'function' ? topic.content(metrics) : topic.content,
        keywords: ["Monad", "Ecosystem", "Stats"]
    };

    articles.unshift(newArticle);
    fs.writeFileSync(articlesPath, JSON.stringify(articles.slice(0, 50), null, 2));
    console.log(`Generated: ${newArticle.title}`);
}

generateArticle();
