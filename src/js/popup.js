;(function() {
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
    }
    else {
      console.log('lll');
    }
  });

  function test(i) {
    return 'hahaha' + i;
  }

  setTimeout(function() {
    //alert(document);
    //alert(document.body);
    //alert(document.body.innerHTML);
    document.body.innerHTML = 'hihihi2';
  },1000);

})();