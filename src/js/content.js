console.log('Content, chrome sync!');

let match = document.title.match(/code=(.*)/);
if (match) {
  chrome.runtime.sendMessage({ type: 'setAuthorizationCode', code: match[1] });
}

let protodemo = require('./syncRequest');

window.protodemo = protodemo;
