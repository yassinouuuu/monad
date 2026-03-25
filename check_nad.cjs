fetch('https://nad.fun')
  .then(r => r.text())
  .then(t => {
    const tokens = t.match(/href=[\"']([^\"']+?)[\"']/g);
    if (tokens) {
      console.log(tokens.filter(href => href.includes('token') || href.includes('coin')).slice(0, 50).join('\n'));
    } else {
      console.log('No matches');
    }
  });
