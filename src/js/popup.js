let querystring = require('querystring');
let config = require('./config');
let syncRequest = require('./syncRequest');

function authentificate() {
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

function printOpenTabs() {
  document.body.innerHTML += '<br /><br />Open tabs: <br /><br />';

  let url = syncRequest.url;
  console.log(url);
  chrome.cookies.getAll({url: url}, cookies => {
    let savedCookies = cookies; // clone?
    savedCookies.forEach(cookie =>
      chrome.cookies.remove({url: url, name: cookie.name})
    );

    setTimeout(function(){}, 0); // flush code above

    syncRequest.SendSyncRequest((tabs) => {
      tabs.slice(0,5).forEach(tab => {
        document.body.innerHTML += tab + '\n<br />';
      });
      savedCookies.forEach(cookie =>
          chrome.cookies.set({
            url: url,
            name:cookie.name,
            value: cookie.value,
            domain: cookie.domain,
            path:cookie.path,
            secure: cookie.secure,
            httpOnly: cookie.httpOnly,
            expirationDate: cookie.expirationDate,
            storeId: cookie.storeId
          })
      );

    });

  });
}

function run() {
  chrome.storage.local.get('tokens', (items) => {
    if (!items.tokens) {
      authentificate();
    } else {
      document.body.innerHTML = JSON.stringify(items);
      printOpenTabs();
    }
  });
}

document.addEventListener("DOMContentLoaded", run);
