
async function debugMore() {
  try {
    console.log("--- DEX Overview (Monad) ---");
    const dexRes = await fetch('https://api.llama.fi/overview/dexs/monad?dataType=dailyVolume');
    const dexData = await dexRes.json();
    console.log("DEX total24h:", dexData.total24h);
    console.log("DEX total7d:", dexData.total7d);
    console.log("DEX total30d:", dexData.total30d);
    console.log("DEX change_1d:", dexData.change_1d);

    console.log("\n--- Fees/Revenue Full Response ---");
    const feesRes = await fetch('https://api.llama.fi/overview/fees/monad?dataType=dailyFees');
    const feesData = await feesRes.json();
    const sumRevenue = feesData.protocols.reduce((sum, p) => sum + (p.totalRevenue24h || p.dailyRevenue || 0), 0);
    console.log("Sum of Protocol Revenue on Monad:", sumRevenue);
    console.log("Top Level change_1d (Fees):", feesData.change_1d);

    console.log("\n--- Stablecoins Search ---");
    const stableRes = await fetch('https://stablecoins.llama.fi/stablecoins');
    const stableData = await stableRes.json();
    const monadRelated = stableData.peggedAssets.filter(a => {
        const chains = Object.keys(a.chainCirculating || {});
        return chains.some(c => c.toLowerCase().includes('monad'));
    });
    console.log("Monad Related Stablecoins:", monadRelated.map(a => ({ name: a.name, symbol: a.symbol, chains: Object.keys(a.chainCirculating) })));

    console.log("\n--- Yields (Monad) ---");
    const yieldsRes = await fetch('https://yields.llama.fi/pools');
    const yieldsData = await yieldsRes.json();
    const monadYields = yieldsData.data.filter(p => p.chain.toLowerCase() === 'monad');
    console.log("Monad Yield Pools Count:", monadYields.length);
    if(monadYields.length > 0) {
        console.log("Top 3 Yields:", monadYields.sort((a,b) => b.apy - a.apy).slice(0, 3).map(y => ({ project: y.project, symbol: y.symbol, apy: y.apy })));
    }

  } catch (e) {
    console.error("Debug failed:", e);
  }
}

debugMore();
