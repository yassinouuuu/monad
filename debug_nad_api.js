
async function testNad() {
  try {
    const urls = [
      'https://api.nadapp.net/order/market_cap?page=1&limit=5&is_nsfw=false&direction=DESC',
      'https://api.nadapp.net/order/creation_time?page=1&limit=5&is_nsfw=false&direction=DESC'
    ];
    
    for (const url of urls) {
      console.log(`\nTesting: ${url}`);
      const res = await fetch(url);
      console.log(`Status: ${res.status}`);
      if (res.ok) {
        const json = await res.json();
        console.log(`Found ${json.data ? json.data.length : 0} items`);
        if (json.data && json.data.length > 0) {
          console.log('Sample item structure:', JSON.stringify(json.data[0], null, 2).substring(0, 500));
        }
      } else {
        console.log('Error body:', await res.text());
      }
    }
  } catch (e) {
    console.error('Fetch failed:', e);
  }
}

testNad();
