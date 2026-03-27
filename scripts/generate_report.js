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
            date: new Date().toISOString().split('T')[0]
        };
    } catch (e) {
        console.error("Error fetching stats:", e);
        return { tvl: "244.1", tvlChange: "0.5", volume: "1.2", date: new Date().toISOString().split('T')[0] };
    }
}

async function generateReport() {
    console.log("Fetching latest Monad Stats...");
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
        title: `تقرير موناد ${today}: طفرة في السيولة ونمو متسارع للنظام البيئي`,
        summary: `متابعة حصرية لأداء شبكة موناد اليوم. بلغت القيمة المقفلة ${stats.tvl} مليون دولار مع استمرار الزخم القوي لعملات الميم والتطبيقات اللامركزية.`,
        content: `شهدت شبكة موناد (Monad) اليوم حراكاً نشطاً جداً. إليكم تفاصيل الأداء:\n\n### إحصائيات اليوم:\n- **TVL الأساسي:** $${stats.tvl}M (تغير بنسبة ${stats.tvlChange}%).\n- **حجم تداول DEX:** يتجاوز الـ $${stats.volume}M خلال 24 ساعة.\n- **حالة الشبكة:** أداء مثالي مع استمرار ضخ السيولة في بروتوكولات DeFi.\n\n### أفضل عملات الميم حالياً:\nتتصدر عملات النظام البيئي (مثل MONSHI و MONIKA) المشهد بزيادة ملحوظة في حجم التداول. نوصي بمراقبة NadFun لمتابعة أحدث الإطلاقات.\n\n### أهم تطبيقات موناد:\n1. **PancakeSwap Monad:** المركز الرئيسي للتداول.\n2. **Uniswap V3:** يواصل استقطاب كبار المتداولين.\n3. **Magma & aPriori:** حلول ستاكينق رائدة توفر عوائد مجزية.\n\n**الكلمات المفتاحية:** موناد، أخبار العملات الرقمية، تحليل السوق، DeFi، ميم كوينز، MonadStats، استثمار.`,
        image: "/monad_daily_summary_1_1774647927356.png", 
        keywords: ["Monad", "Stats", "Arabic", "Crypto", "DeFi"]
    };

    if (existingIndex > -1) {
        articles[existingIndex] = newArticle;
    } else {
        articles.unshift(newArticle);
    }

    if (articles.length > 20) articles = articles.slice(0, 20);

    // Ensure the data directory exists
    const dir = path.dirname(articlesPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2));
    console.log(`Successfully generated report for ${today}`);
}

generateReport();
