console.log('Content, chrome sync!');

let match = document.title.match(/code=(.*)/);
if (match) {
  chrome.runtime.sendMessage({ type: 'setAuthorizationCode', code: match[1] }, r =>
    alert('Token saved. Please click on the Sync icon one more time and fill in the email of the account you just used.'));
}

chrome.runtime.sendMessage({ type: 'visitedWebsite' }, resp=>console.log(resp));

