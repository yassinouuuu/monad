async function checkChains() {
    try {
        const res = await fetch('https://api.llama.fi/v2/chains');
        const chains = await res.json();
        const monad = chains.find(c => c.name.toLowerCase().includes('monad'));
        console.log("Found Monad chain:", monad);
        
        const monadExact = chains.find(c => c.name.toLowerCase() === 'monad');
        console.log("Found Exact Monad chain:", monadExact);
        
        const similar = chains.filter(c => c.name.toLowerCase().includes('mon'));
        console.log("Similar chains:", similar.map(s => s.name));
    } catch (e) {
        console.error("Failed to fetch chains:", e);
    }
}

checkChains();
