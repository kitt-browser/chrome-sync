let request = require('request');
let config = require('./config');

function getAPITokens(authorizationCode, cb) {
  request.post({
    url: 'https://www.googleapis.com/oauth2/v3/token',
    form: {
      code: authorizationCode,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code'
    }
  },
  (err, response, body) => {
    if (!err) {
      cb(JSON.parse(body));
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch(message.type) {
    case 'setAuthorizationCode':
      getAPITokens(message.code, tokens => {
        chrome.storage.local.set({ tokens: tokens });
        sendResponse();
      });
      break;

    case 'visitedWebsite':
      let info = {
        tabId: sender.tab.id,
        windowId: sender.tab.windowId,
        navigation: {
          url: sender.tab.url,
          title: sender.tab.title || 'Default title'
        }
      };

      let res = JSON.stringify(info, null, ' ');

      console.log(res);
      sendResponse(info);
      break;
  }

  return true;
});

function updateStoredAccessToken(newAccessToken) {
  chrome.storage.local.get('tokens', (res) => {
    res.tokens.access_token = newAccessToken;
    chrome.storage.local.set({tokens: res.tokens });
  });
}

function refreshAccessToken() {
  chrome.storage.local.get('tokens', (res) => {
    if (!res || !res.tokens) {
      return;
    }

    request.post({
      url: 'https://www.googleapis.com/oauth2/v3/token',
      form:{
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: res.tokens.refresh_token
      }
    }, (err, response, body) => {
      let parsedBody = JSON.parse(body);
      updateStoredAccessToken(parsedBody.access_token);
      setTimeout(refreshAccessToken, 1000 * parsedBody.expires_in);
    });
  });
}

refreshAccessToken();


//chrome.webRequest.onBeforeSendHeaders.addListener(
//  function(details) { console.log(details.url); },
//  { urls: ['<all_urls>'], types: ['xmlhttprequest']},
//  ['requestHeaders', 'blocking']
//);
