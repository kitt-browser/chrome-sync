let db = require('./db').browserDb('Kitt');

console.log('Content, chrome sync!');

let match = document.title.match(/code=(.*)/);
if (match) {
  chrome.runtime.sendMessage({ type: 'setAuthorizationCode', code: match[1] });
}

chrome.runtime.sendMessage({ type: 'visitedWebsite'}, (response) => alert(response));

