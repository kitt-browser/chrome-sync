'use strict';
let request = require('request');
let ProtoBuf = require("protobufjs");
let syncProto = require('./sync.proto');
let db = require('./db');

let builder = ProtoBuf.loadProto(syncProto);
let root = builder.build('sync_pb');

var SyncFlags = {
  OPEN_TABS: 1,
  BOOKMARKS: 2,
  OMNI_BOX: 4,
  PASSWORDS: 8
};
var SyncOptions = {
  flags: 1
};

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
  request.share = ''; // no idea for myRequest.SetShare(_syncOptions.User);
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

  //return request.toArrayBuffer();
  console.log('------------', request.toArrayBuffer());
  return request.toBuffer();
}

function readSyncRequest(ClientToServerResponseItem) {
   let decoded = root.ClientToServerResponse.decode(ClientToServerResponseItem);
   console.log(decoded);
}

function SendSyncRequestWithAccessToken(accessToken, db) {
  let syncRequest = BuildSyncRequest(db);

  request.get({
    url: /*'http://localhost:1234'*/'https://clients4.google.com/chrome-sync/',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Bearer': accessToken
    },
    encoding: null, //  if you expect binary data
    body: syncRequest
  }, (error, response, body) => {
    console.log(error, body);
    if (!error) {
      readSyncRequest(body);
    }
  });

}

function SendSyncRequest(db) {
  chrome.storage.local.get('tokens', function(container) {
    let accessToken = container.tokens.access_token;
    SendSyncRequestWithAccessToken(accessToken, db);
  });
}
module.exports = {
  SendSyncRequestWithAccessToken: SendSyncRequestWithAccessToken,
  BuildSyncRequest: BuildSyncRequest,
  SendSyncRequest: SendSyncRequest,
  db:db,
  sync: root
};