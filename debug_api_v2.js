
async function testDeFiLlama() {
  try {
    console.log("--- Protocols List ---");
    const protocolsRes = await fetch('https://api.llama.fi/protocols');
    const protocols = await protocolsRes.json();
    const monadProtocols = protocols.filter(p => p.chains.includes('Monad'));
    console.log("Monad Protocols Count:", monadProtocols.length);
    console.log("First Monad Protocol:", JSON.stringify(monadProtocols[0], null, 2));

    console.log("\n--- Stablecoins (New URL) ---");
    // Try without path if it fails, or check 'all'
    const stableAllRes = await fetch('https://stablecoins.llama.fi/stablecoins');
    const stableAll = await stableAllRes.json();
    const monadStable = stableAll.peggedAssets.filter(a => a.chainCirculating && a.chainCirculating.monad);
    console.log("Monad Stablecoins Found:", monadStable.length);
    const totalStableCirculating = monadStable.reduce((sum, a) => sum + (a.chainCirculating.monad.current || 0), 0);
    console.log("Total Stable Circulating (USD):", totalStableCirculating);

    console.log("\n--- Fees & Revenue (Full Structure) ---");
    const feesRes = await fetch('https://api.llama.fi/overview/fees/monad?dataType=dailyFees');
    const fees = await feesRes.json();
    console.log("Top Level total24h Fees:", fees.total24h);
    console.log("Top Level totalRevenue24h:", fees.totalRevenue24h);

  } catch (e) {
    console.error("Test failed:", e);
  }
}

testDeFiLlama();
