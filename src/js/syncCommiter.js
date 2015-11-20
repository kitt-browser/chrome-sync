'use strict';
let clientToServerRequest = require('./clientToServerRequest');
let db = require('./db');
let Long = require('long');
let _ = require('lodash');

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

function createNewEmptySyncEntity(name, specifics) {
  let currentTime = Date.now() * 1000;

  // in format "rand271398.372016847131440062545931"
  let randomString = 'rand'+(Math.random()*1000000).toString() + Date.now().toString();


  return { // Sync entity, filled like chrome://sync-internals
    id_string: 'Z:'+ randomString,
    //parent_id_string: '0',
    //parent_id_string: 'Z:ADqtAZy7SBx3aAw4bMqMmgyPux9TG1JJ987uhKdvtU1wFUUoZbTIsWnmLXKHils2naYxig4WvsRZ7ZMvC1eHc5texHwOTNJrLg==',
    version: 0,
    name: name,
    position_in_parent: 0,

    // 2* whatever
    //ctime: currentTime,  // consider using Long.js
    //mtime: currentTime,

    specifics: specifics
//    specifics: {
//      "session": {
//        //"session_tag": "session_syncJnGGyLEoZ3C+9bWCPbO2QQ==",
//        "tab": {
//          "navigation": [
//            {
//              //"timestamp_msec": "1440073418036",
//              "title": "Organizační struktura / Lucie ŠimůnkováHAHAAHA",
//              //"unique_id": 801,
//              "virtual_url": websiteUrl
//            }
//          ],
//          //"tab_id": 1027,
//          // "window_id": 637
//        },
//        //"tab_node_id": 336 // MAY turn out to be important...
//      }
//    }
  };
}
function BuildCommitRequest(entries) {
  //console.log('----current time:', currentTime);
  let request = new clientToServerRequest.rootProto.ClientToServerMessage({
    message_contents: 'COMMIT',
    commit: {
      //cache_guid: 'random_string',
      config_params: {
        enabled_type_ids: [50119],
        tabs_datatype_enabled: true
      },
      entries: entries
    }
  });

  //clientToServerRequest.fillRequestFromDb(request, db);
  return request;
}

function updateProcessor(ClientToServerResponseItem) {
  return ClientToServerResponseItem;
}

function addOpenTab(websiteUrl, accessToken) {
  return clientToServerRequest.sendRequest(accessToken, BuildCommitRequest(createEntry(websiteUrl)), db)
    .then(updateProcessor)
    .catch(error => console.log('Add Open Tab Error:',error));
}

function addLinkToEntry(entry, link) {
  let navigation = {
    "title": link.title,
    "virtual_url": link.url
  };
  let tab = entry.specifics.session.tab;
  tab.navigation.push(navigation);
  tab.current_navigation_index = tab.current_navigation_index + 1;

  return entry;
}

function commitEntry(accessToken, entryEntries) {
  let entries = _.isArray(entryEntries)? entryEntries : [entryEntries];
  return clientToServerRequest.sendRequest(accessToken, BuildCommitRequest(entries), db);
}

function commitNewLinkToEntry(accessToken, entry, link) {
  let newEntry = addLinkToEntry(entry, link);
  return commitEntry(accessToken, newEntry);
}
module.exports = {addOpenTab, commitNewLinkToEntry, addLinkToEntry, createNewEmptySyncEntity, commitEntry};
