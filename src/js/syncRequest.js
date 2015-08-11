'use strict';
function inBrowser() {
  return typeof window !== 'undefined';
}

let request = inBrowser() ?
  require('./libs/browser-request-yegodz'):
  require('request');



let ProtoBuf = require("protobufjs");
let syncProto = require('./sync.proto');
let db = require('./db');
let config = require('./config');
let builder = ProtoBuf.loadProto(syncProto);
let root = builder.build('sync_pb');

let url = 'https://clients4.google.com/chrome-sync/command';

function InitializeMarker(datatype, db) {
  var marker = db.getSyncProgress(datatype.data_type_id);
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
  var datatype = new root.DataTypeProgressMarker({
    'data_type_id': fieldNumber
  });
  InitializeMarker(datatype, db);
  return datatype;
}

function BuildSyncRequest(db) {
  if (!db) {
    throw new Exception('user logged out!');
  }

  let request = new root.ClientToServerMessage();
  request.share = db.getUserShare();
  request.message_contents = 'GET_UPDATES';

  let callerInfo = new root.GetUpdatesCallerInfo;
  callerInfo.notifications_enabled = true;
  callerInfo.source = 'PERIODIC';

  let getUpdatesMessage = new root.GetUpdatesMessage();
  getUpdatesMessage.caller_info = callerInfo;
  getUpdatesMessage.fetch_folders = true;


  // opentabs
  let sessionDataType = InitializeDataType(db, 50119);  // EntitySpecifics -> tag number?
  getUpdatesMessage.add('from_progress_marker', sessionDataType);


  let syncState = db.getSyncState();
  if (syncState) {
    if(syncState.server_chips) {
      request.bag_of_chips = new root.ChipBag({'server_chips': syncState.server_chips});
    }

    if(syncState.store_birthday) {
      request.store_birthday = syncState.store_birthday;
    }
  }

  request.get_updates = getUpdatesMessage;
  request.client_status = new root.ClientStatus();

  return request.toArrayBuffer();
}

function getAccessTokenPromise(accessToken) {
  if (typeof accessToken === 'string') { // for testing
    return Promise.resolve(accessToken);
  } else {
    return new Promise(function(resolve, reject) {
      return chrome.storage.local.get('tokens', resolve)
    }).then(container => container.tokens.access_token);
  }
}

function SendAuthorizatedHttpRequest(accessToken, body) {
  return new Promise(function(resolve, reject) {
    return request.post({
      url: url,
      qs: {
        'client': 'Google+Chrome',
        'client_id': config.clientId
      },
      headers: {
        //'cookie': "a=b",
        'Content-Type': 'application/octet-stream',
        'Authorization': 'Bearer '+ accessToken
      },
      encoding: null, //  if you expect binary data
      responseType: 'buffer',
      body: body
    }, (error, response, body) => {
      let stringBody = body.toString();
      if (stringBody.includes('<TITLE>Unauthorized</TITLE>')) {
        reject('401 Unauthorized (probably outdated access token)')
      }
      if (stringBody.includes('<TITLE>Bad Request</TITLE>')) {
        reject('400 Bad Request (probably wrong format of the input)')
      }

      if (!error) {
        resolve(body);
      } else {
        reject(body);
      }
    });
  });
}


function readSyncRequest(ClientToServerResponseItem) {
  if (ClientToServerResponseItem.toString().length < 1000) { //todo
    console.log('******read (toString)******');
    console.log(ClientToServerResponseItem.toString());
  }
  let openTabs = [];
  let decoded = root.ClientToServerResponse.decode(ClientToServerResponseItem);
  let entries = decoded.get_updates.entries;
  entries.forEach( (val, key) => {
    let tab =  val.specifics.session.tab;
    if (tab) {
      let navigation = tab.navigation;
      let lastNavigation = navigation[navigation.length - 1]; // redirects + tab history

      openTabs.push(lastNavigation.virtual_url);
    }
  });
  openTabs.reverse();
  return openTabs;
}


function SendSyncRequest(accessToken) {
  return getAccessTokenPromise(accessToken)
    .then(accessToken => {
      let syncRequest = new Uint8Array(BuildSyncRequest(db));
      return SendAuthorizatedHttpRequest(accessToken, syncRequest)
    })
    .then(readSyncRequest)
    .catch(error => console.log(error));
}

// UPDATE
function BuildUpdateRequest(websiteUrl) {
  let request = new root.ClientToServerMessage({
    share: db.getUserShare(),
    message_contents: 'COMMIT',
    commit: {
      config_params: {
        enabled_type_ids: [50119]
      }
    }
  });
  // todo add rest, chipbad, etc etc


  return request.toArrayBuffer();
}

module.exports = {
  SendSyncRequest: SendSyncRequest,
  BuildUpdateRequest: BuildUpdateRequest,
  db:db,
  //sync: root,
  url: url
};
