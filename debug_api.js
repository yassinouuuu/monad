
async function testDeFiLlama() {
  try {
    console.log("--- Chains ---");
    const chainsRes = await fetch('https://api.llama.fi/v2/chains');
    const chains = await chainsRes.json();
    const monad = chains.find(c => c.name.toLowerCase() === 'monad');
    console.log("Monad Chain Data:", JSON.stringify(monad, null, 2));

    console.log("\n--- Stablecoins ---");
    const stableRes = await fetch('https://stablecoins.llama.fi/stablecoincharts/monad');
    const stable = await stableRes.json();
    console.log("Monad Stablecoins (latest 2):", JSON.stringify(stable.slice(-2), null, 2));

    console.log("\n--- Fees & Revenue ---");
    const feesRes = await fetch('https://api.llama.fi/overview/fees/monad?dataType=dailyFees');
    const fees = await feesRes.json();
    console.log("Monad Fees/Revenue Data:", JSON.stringify(fees, null, 2));
  } catch (e) {
    console.error("Test failed:", e);
  }
}

testDeFiLlama();
