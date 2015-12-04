'use strict';
let _ = require('lodash');

let clientToServerRequest = require('./clientToServerRequest');
let entriesManagerFactory = require('./entriesManager');

function _jsonStringify(json) {
  return JSON.stringify(json, (k, v) => {
    if (k=== 'data')
      return 'LONGDATA';
    if(v===null || v===false)
      return;
    return v;

  }, '  ')
}
function _createSyncEntity(db, specifics) {
  let entriesManager = entriesManagerFactory(db);

  //let currentTime = Date.now() * 1000;

  // in format "rand271398.372016847131440062545931"
  let randomString = 'rand'+(Math.random()*1000000).toString() + Date.now().toString();

  return {
    id_string: 'Z:'+ randomString,
    parent_id_string: entriesManager.findRootIdString(),
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

  //BUGFIX: in response I get some weird data structure although I should only get bytes...
  // not needed anyway
  delete header.ordinal_in_parent;

  return header;
}
function _createHeader(db) {
  return _createSyncEntity(db, _createHeaderSpecifics(db));
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
  let entriesManager = entriesManagerFactory(db);

  let tab = entriesManager.findTab(tabId, windowId);
  let needsToUpdateHeader = false;
  if (!tab) { // no such tab exists. Create the tab + add record to the header for the tab
    needsToUpdateHeader = true;
    console.error('creatING new tab');
    tab = _createTab(db, tabId, windowId);
    console.error('created new tab');
  }
  tab = _appendNavigationToTab(tab, navigation);
  console.error('navigation to tab appended');

  let header = _.cloneDeep(entriesManager.findHeader());
  if (!header) {
    header = _createHeader(db);
    console.error('created header');
  }
  header = _appendRecordsToHeader(header, tabId, windowId);
  console.error('appended records to header');

  return needsToUpdateHeader? [header, tab] : [tab];
}

function wipeSessionEntries(db) {
  let entriesManager = entriesManagerFactory(db);

  let sessionEntries = entriesManager.findItemsInSession();
  return _.map(sessionEntries, entry => {entry.deleted = true; return entry;});
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

function commitEntry(accessToken, db, entryEntries) {
  let entries = _.isArray(entryEntries)? entryEntries : [entryEntries];
  console.error('building commit request with entries');
  console.error(_jsonStringify(entries));
  let request = _buildCommitRequest(entries);
  console.error('console request sucessfully built! gonna send it');
  return clientToServerRequest.sendRequest(accessToken, request, db);
}

module.exports = {
  _createHeader,
  _appendRecordsToHeader,

  _createTab,
  _appendNavigationToTab,

  _buildCommitRequest, // testing only

  wipeSessionEntries,
  createEntriesForAddedNavigation,
  commitEntry
};
