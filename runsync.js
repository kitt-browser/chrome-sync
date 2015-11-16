#!/usr/local/bin/node

// This file is used for testing the openTabs and addNewTab commands.
// you should run it as |./runsync.js --token=<your_access_token>|
// To obtain the access token, open the popup window(browser action) of the extension and copy&paste it.
// Token is valid for 1 hour.

'use strict';


let accessToken = false;
process.argv.forEach( val => {
  let tokenStart = '--token=';
  if (val.startsWith(tokenStart)) {
    accessToken = val.substr(tokenStart.length);
  }
});

if (!accessToken) {
  console.log('Error. Not supplied with access_token. Please run it as |./runsync.js --token=<your_access_token>|');
  process.exit(1);
}

// ... old version, obsolete, But I have if in case I checkout to some older commit.
// let s = require('./src/js/syncRequest');
//
// s.GetOpenTabs(accessToken).then(tabs => {
//   console.log('********************************');
//   console.log('(runsync.js) tabs length', tabs.length, 'lasttab url=', tabs[0])
//   console.log('********************************');
// }).then(function() {
// 	//return s.addOpenTab('http://testpage.com', accessToken);
// }).then(
// 	res => console.log(res)
// );
//

let getOpenTabs = require('./src/js/syncGetter').getOpenTabs;
let addOpenTab = require('./src/js/syncCommiter').addOpenTab;

getOpenTabs(accessToken).then(tabs => {
  console.log('********************************');
  console.log('(runsync.js) tabs length', tabs.length, 'lasttab url=', tabs[0])
  console.log('********************************');
}).then(
  ()=>
    //null
    addOpenTab('http://www.mff.cuni.cz/fakulta/struktura/lide/889MOJUPDATTE.HTMLPCAMREPLACE', accessToken)
).then(() => getOpenTabs(accessToken));


