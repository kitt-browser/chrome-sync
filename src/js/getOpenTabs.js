'use strict';
let clientToServerRequest = require('./clientToServerRequest');
let db = require('./db');

let my_entry; // debug TODO

function InitializeMarker(datatype, db) {
  var marker = db.getProgressMarker(datatype.data_type_id);
  if (marker) {
    if (marker.notification_hint) {
      datatype.notification_hint = marker.notification_hint;
    }
    datatype.token = marker.token; // used bytestring
    if (marker.timestamp_token_for_migration !== 0) {
      datatype.timestamp_token_for_migration = marker.timestamp_token_for_migration;
    }
  }
}

function InitializeDataType(db, fieldNumber) {
  var datatype = new clientToServerRequest.rootProto.DataTypeProgressMarker({
    'data_type_id': fieldNumber
  });
  InitializeMarker(datatype, db);
  return datatype;
}

function BuildSyncRequest(db) {
  if (!db) {
    throw new Exception('user logged out!');
  }

  let request = new clientToServerRequest.rootProto.ClientToServerMessage({
    share: db.getUserShare(),
    message_contents: 'GET_UPDATES',
    get_updates: {
      caller_info: {
        notifications_enabled: true,
        source: 'PERIODIC'
      },
      fetch_folders: true
    }
  });
  // opentabs
  let sessionDataType = InitializeDataType(db, 50119);  // EntitySpecifics -> tag number
  request.get_updates.add('from_progress_marker', sessionDataType);

  return request;
}

function parseOpenTabs(ClientToServerResponseItem) {
  let openTabs = [];
  let entries = ClientToServerResponseItem.get_updates.entries;

  entries.forEach( (entry, key) => {
    let tab =  entry.specifics.session.tab;
    if (tab) {
      if (key == entries.length - 2) { // todo
        my_entry = entry;
      }
      let navigation = tab.navigation;
      let lastNavigation = navigation[navigation.length - 1]; // redirects + tab history
      if (key > entries.length - 10) {
        console.log('v=', entry.version.toString(), 'id_str=', entry.id_string, 'client_defined_unique_tag=', entry.client_defined_unique_tag, 'url=', lastNavigation.virtual_url);
        console.log('');
      }
      openTabs.push(lastNavigation.virtual_url);

    }
  });
  openTabs.reverse();
  return openTabs;
}

function getOpenTabs(accessToken) {
  return clientToServerRequest.sendRequest(accessToken, BuildSyncRequest(db), db)
    .then(parseOpenTabs)
    .catch(error => console.error(error));
}

module.exports = getOpenTabs;
