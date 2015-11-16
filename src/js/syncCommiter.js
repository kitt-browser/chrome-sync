'use strict';
let clientToServerRequest = require('./clientToServerRequest');
let db = require('./db');

function createEntry(websiteUrl) {
  let currentTime = Date.now();

  // in format "rand271398.372016847131440062545931"
  let randomString = 'rand'+(Math.random()*1000000).toString() + Date.now().toString();


  return { // Sync entity, filled like chrome://sync-internals
    //attachment_id: [],
    client_defined_unique_tag: 'vesQminyP/Hb2/o7saRF7XHXSCI=',//randomString,

    // 2* whatever
    ctime: currentTime,
    //mtime: currentTime,

    name: websiteUrl,
    non_unique_name: websiteUrl,
    // it's only 13 digits in comparison to 16 used by chrome, hence the multiplication...
    version: currentTime * 1000,
    id_string: 'Z:ADqtAZxYtpOdmzFl4Fx/ECWEY2U2L3Iag7zmrFgUMkOu1n93m9tgVrdsdwOuL6ofxOu/BThnkAH7rF8RLf7eP9+IWjjt+SpLAA==',
    specifics: {
      "session": {
        //"session_tag": "session_syncJnGGyLEoZ3C+9bWCPbO2QQ==",
        "tab": {
          "navigation": [
            {
              //"timestamp_msec": "1440073418036",
              "title": "Organizační struktura / Lucie ŠimůnkováHAHAAHA",
              //"unique_id": 801,
              "virtual_url": websiteUrl
            }
          ],
          //"tab_id": 1027,
          // "window_id": 637
        },
        //"tab_node_id": 336 // MAY turn out to be important...
      }
    }
  };
}
function BuildCommitRequest(entry, db) {
  //console.log('----current time:', currentTime);
  let request = new clientToServerRequest.rootProto.ClientToServerMessage({
    message_contents: 'COMMIT',
    commit: {
      //cache_guid: 'random_string',
      config_params: {
        enabled_type_ids: [50119],
        tabs_datatype_enabled: true
      },
      entries: [entry]
    }
  });

  //clientToServerRequest.fillRequestFromDb(request, db);
  return request;
}

function updateProcessor(ClientToServerResponseItem) {
  return ClientToServerResponseItem;
}

function addOpenTab(websiteUrl, accessToken) {
  return clientToServerRequest.sendRequest(accessToken, BuildCommitRequest(createEntry(websiteUrl), db), db)
    .then(updateProcessor)
    .catch(error => console.log('Add Open Tab Error:',error));
}

module.exports = {addOpenTab};
