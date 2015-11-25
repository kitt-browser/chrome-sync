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



function _createSyncEntity(db, specifics) {
  let currentTime = Date.now() * 1000;

  // in format "rand271398.372016847131440062545931"
  let randomString = 'rand'+(Math.random()*1000000).toString() + Date.now().toString();


  return {
    id_string: 'Z:'+ randomString,
    version: 0,
    name: db.clientName,
    position_in_parent: 0,

    //ctime: currentTime,
    //mtime: currentTime,

    specifics: specifics
  };
}


// ------------------- header sync entities
function _createHeaderSpecifics(db) {
  return {
    session: {
      session_tag: db.sessionTag,
      tab_node_id: -1,
      header: {
        window: [],
        client_name: db.clientName,
        device_type: 'TYPE_PHONE'
      }

    }
  };
}

function appendRecordsToHeader(headerEntry, tabId, windowId) {
  let windows = headerEntry.specifics.session.header.window;
  let window = _.find(windows, {window_id: windowId});
  if (!window) {
    let emptyWindow = {
      window_id: windowId,
      selected_tab_index: -1,
      browser_type: "TYPE_TABBED",
      tab: []
    };
    windows.push(emptyWindow);
    window = windows[windows.length - 1];
  }

  let containsTab = _.contains(window.tab, tabId);
  if (!containsTab) {
    window.tab.push(tabId);
    window.selected_tab_index = window.tab.length - 1;
  }

  return headerEntry;
}
function createHeaderSyncEntity(db) {
  return _createSyncEntity(db, _createHeaderSpecifics(db));
}


// tab sync entities
function _createTabSpecifics(db, tabId, windowId) {
  return {
    session: {
      session_tag: db.sessionTag,
      tab_node_id: Math.ceil(Math.random() * 1000000),
      tab: {
        tab_id: tabId,
        window_id: windowId,
        tab_visual_index: 0,
        current_navigation_index: 0, // invalid, will be incremented along with navigation
        navigation: []
      }
    }
  };
}

function createTabSyncEntity(db, tabId, windowId) {
  return _createSyncEntity(db, _createTabSpecifics(db, tabId, windowId));
}



function appendNavigationToTab(entry, navigation) {
  navigation = {
    "title": navigation.title,
    "virtual_url": navigation.url
  };
  let tab = entry.specifics.session.tab;
  tab.navigation.push(navigation);
  tab.current_navigation_index = tab.current_navigation_index + 1;

  return entry;
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

function addOpenTab(websiteUrl, accessToken) {
  return clientToServerRequest.sendRequest(accessToken, BuildCommitRequest(createEntry(websiteUrl)), db)
    .catch(error => console.log('Add Open Tab Error:',error));
}

function commitEntry(accessToken, entryEntries) {
  let entries = _.isArray(entryEntries)? entryEntries : [entryEntries];
  return clientToServerRequest.sendRequest(accessToken, BuildCommitRequest(entries), db);
}

module.exports = {addOpenTab, appendRecordsToHeader, appendNavigationToTab, createTabSyncEntity,createHeaderSyncEntity, commitEntry};
