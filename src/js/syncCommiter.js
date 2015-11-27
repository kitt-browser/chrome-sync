'use strict';
let clientToServerRequest = require('./clientToServerRequest');
let db = require('./db');
let Long = require('long');
let _ = require('lodash');

let entriesManager = require('./entriesManager');
entriesManager.init(db);

function _createSyncEntity(db, specifics) {
  //let currentTime = Date.now() * 1000;

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

function _appendRecordsToHeader(header, tabId, windowId) {
  let windows = header.specifics.session.header.window;
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

  return header;
}
function _createHeader(db) {
  return _createSyncEntity(db, _createHeaderSpecifics(db));
}

function _findOrCreateHeader(db) { // TODO: uses two different databases... (constants & records)
  let header = entriesManager.findHeader();
  if (!header) {
    header = _createHeader(db);
  }
  return header;
}

// ------------------- tab sync entities
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

function _createTab(db, tabId, windowId) {
  return _createSyncEntity(db, _createTabSpecifics(db, tabId, windowId));
}



function _appendNavigationToTab(entry, navigation) {
  navigation = {
    "title": navigation.title,
    "virtual_url": navigation.url
  };
  let tab = entry.specifics.session.tab;
  tab.navigation.push(navigation);
  tab.current_navigation_index = tab.current_navigation_index + 1;

  return entry;
}

function createEntriesForAddedNavigation(db, tabId, windowId, navigation) {
  let header;

  let tab = entriesManager.findTab(tabId, windowId);
  if (!tab) { // no such tab exists. Create the tab + add record to the header for the tab
    header = _findOrCreateHeader(db);
    header = _appendRecordsToHeader(header, tabId, windowId);
    tab = createTab(db, tabId, windowId);
  }

  tab = _appendNavigationToTab(tab, navigation);

  return header? [header, tab] : [tab];
}

// TODO: the sync commiter real part. The rest is somehting like: entry creator, modifyier
function _buildCommitRequest(entries) {
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

  return request;
}

function commitEntry(accessToken, entryEntries) {
  let entries = _.isArray(entryEntries)? entryEntries : [entryEntries];
  return clientToServerRequest.sendRequest(accessToken, _buildCommitRequest(entries), db);
}

module.exports = {
  _createHeader,
  _appendRecordsToHeader,
  _findOrCreateHeader,

  _createTab,
  _appendNavigationToTab,

  createEntriesForAddedNavigation,
  commitEntry
};
