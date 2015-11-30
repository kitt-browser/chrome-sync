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
  }
});

function updateStoredAccessToken(newAccessToken) {
  chrome.storage.local.get('tokens', (res) => {
    res.tokens.access_token = newAccessToken;
    chrome.storage.local.set({tokens: res.tokens });
  });
}

function refreshAccessToken() {
  chrome.storage.local.get('tokens', (res) => {
    let tokens = res.tokens;
    request.post({
      url: 'https://www.googleapis.com/oauth2/v3/token',
      form:{
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: tokens.refresh_token
      }
    }, (err, response, body) => {
      let accessToken = JSON.parse(body).access_token;
      updateStoredAccessToken(accessToken);
    });
  });
}

//refreshAccessToken();
//setInterval(refreshAccessToken, 1000* 3600);


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//  console.log('tabId:', tabId);
//  console.log('changeInfo:', changeInfo);
//  console.log('tab:', tab);
});



// for debugging purposes only
chrome.tabs.onActivated.addListener(activeInfo => {
  console.log(`activated tab: tabId=${activeInfo.tabId}, windowId=${activeInfo.windowId}`);
});

chrome.webRequest.onBeforeSendHeaders.addListener((details) => {
    if (details.url.indexOf('?') !== -1) {
      return{cancel:true};
    }

    // REMOVE HOST,
    console.log(details.url); console.log(details);
    for (var i = 0; i < details.requestHeaders.length; ++i) {
      if (details.requestHeaders[i].name === 'Accept') {
        details.requestHeaders[i].value= 'text/html,text/FOOBAR;q=0.9';
      }

      if (details.requestHeaders[i].name === 'User-Agent') {
        details.requestHeaders[i].splice(i, 1);
        break;
      }
    }
    details.requestHeaders.push({name: 'FOOO', value: 'BARR'});

    return {requestHeaders: details.requestHeaders};
  },
  { urls: ["*://www.novellizator.cz/*"], types: ['xmlhttprequest']},
  ['requestHeaders', 'blocking']
);
