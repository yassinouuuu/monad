
async function test() {
  try {
    const res = await fetch('https://api.llama.fi/v2/chains');
    const data = await res.json();
    const monad = data.find(c => c.name.toLowerCase() === 'monad');
    console.log('Monad chain data:', JSON.stringify(monad, null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
