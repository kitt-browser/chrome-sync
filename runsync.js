// This file is used for testing the openTabs and addNewTab commands.
// you should run it as |iojs   --harmony --harmony_arrow_functions --harmony_object_literals ./runsync.js|

'use strict';

// ... old version, obsolete, But I have if in case I checkout to some older commit.
// let s = require('./src/js/syncRequest');
// let accessToken = "ya29.2QHaUp9o8nZHtiqkwMh5NJ1tTIE-UvOOzzzmZKaboSZtBhMMyIs96uuGq0oy8sDwDbst";
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




let getOpenTabs = require('./src/js/getOpenTabs');
let addOpenTab = require('./src/js/addOpenTab');

// you obtain the access token when you open the popup window(browser action) of the extension. Valid for 1 hour.
let accessToken ="ya29.2gGIrmkAnxlKBWCuTz9TGSvoGplaEya6ypWBATaE-H6SQpHXe6yKMaAT_bLEgRtzzIbC4A";


getOpenTabs(accessToken).then(tabs => {
  console.log('********************************');
  console.log('(runsync.js) tabs length', tabs.length, 'lasttab url=', tabs[0])
  console.log('********************************');
}).then(() => {
	return addOpenTab('http://testpage.com', accessToken);
}).then(
	res => console.log(res)
);


