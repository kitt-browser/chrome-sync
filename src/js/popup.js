function run() {
  let querystring = require('querystring');
  let config = require('./config');

  chrome.storage.local.get('tokens', (items) => {
    if (!items.tokens) {
      let url = 'https://accounts.google.com/o/oauth2/auth' + '?' + querystring.stringify({
        response_type: 'code',
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        scope: 'https://www.googleapis.com/auth/chromesync',
        state: 'kitt-chrome-sync'
      });
      chrome.tabs.create({ url: url });
      window.close();
    } else {
      document.body.innerHTML = JSON.stringify(items);
    }
  });
}

document.addEventListener("DOMContentLoaded", run);
