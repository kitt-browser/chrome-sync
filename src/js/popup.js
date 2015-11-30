let querystring = require('querystring');
let config = require('./config');
let url = config.syncServerEndpoint;

let getOpenTabs = require('./syncGetter').getOpenTabs;

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

function getAllCookiesPromise(obj) {
  return new Promise(function(resolve, reject) {
    chrome.cookies.getAll(obj, resolve);
  });
}

function deleteCookiesPromise(cookiesToDelete) {
  console.log('I should delete folloowign cookies' + cookiesToDelete);

  let promisesPerCookie = cookiesToDelete.map( cookie =>
    new Promise((resolve, reject) => chrome.cookies.remove({url: url, name: cookie.name}, resolve))
  );
  return Promise.all(promisesPerCookie);
}

function restoreCookiesPromise(cookies) {
  cookies.forEach(cookie =>
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
}



function printOpenTabs() {
  document.body.innerHTML += '<br /><br />Open tabs: <br /><br />';
  var allCookies = getAllCookiesPromise({url:url});

  allCookies
  .then(deleteCookiesPromise)
  .then(getOpenTabs)
  .then(openTabs => {
    openTabs.slice(0,5).forEach(tab => {
      document.body.innerHTML += tab + '\n<br />';
    });
  })
  .then(() => allCookies.then(restoreCookiesPromise));
}

function main() {
  chrome.storage.local.get('tokens', (items) => {
    if (!items.tokens) {
      authentificate();
    } else {
      document.body.innerHTML = JSON.stringify(items);
      printOpenTabs();
    }
  });
}

function main2() {
  document.body.innerHTML='';
}
//document.addEventListener("DOMContentLoaded", main2);
