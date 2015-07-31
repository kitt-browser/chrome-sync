'use strict';
let request = require('request');
//let request = require('browser-request');
let ProtoBuf = require("protobufjs");
let syncProto = require('./sync.proto');
let db = require('./db');
let config = require('./config');
let builder = ProtoBuf.loadProto(syncProto);
let root = builder.build('sync_pb');
var Bufferr = require('buffer/').Buffer;

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

  //console.log('sss',JSON.stringify(root.ClientToServerMessage.decode(request.encode())));
  //console.log('------------', request.toArrayBuffer());
  //return request.toBuffer(); //node
  return request.toArrayBuffer();
}

function readSyncRequest(ClientToServerResponseItem, cb) {
  console.log('******read (toString)******');
  //console.log(ClientToServerResponseItem.toString());
  console.log('****** decode ****');
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
  cb(openTabs);
  //console.log(decoded.get_updates.entries[0]);
}

function SendSyncRequestWithAccessToken(accessToken, db, cb) {
  let syncRequest = new Uint8Array(BuildSyncRequest(db));
  let url = /*'http://localhost/chrome-sync/command';//*/'https://clients4.google.com/chrome-sync/command';

//let syncRequest = typeof window === 'undefined' ? BuildSyncRequest(db) // nodejs
//  : /* new Uint8Array(BuildSyncRequest(db)); //*/new Bufferr(new Uint8Array(BuildSyncRequest(db))); // browser
//  let $ = require('jquery');
//
//  $.ajax({
//    url: url,
//    type: 'POST',
//    headers: {
//      'Content-Type': 'application/octet-stream',
//      'Authorization': 'Bearer '+ accessToken
//    },
//    data: syncRequest,
//    processData: false
//  }).done((data) => console.log(data));

  console.log('syncRequest', syncRequest, 'instanceof Uint8Array?', syncRequest instanceof Uint8Array,
    'len:', syncRequest.length, 'TYPE:', syncRequest.toString());

  request.post({
    url: url,
    //qs: {
    //  'client': 'Google Chrome',
    //  'client_id': config.clientId
    //},
    headers: {
      // todo just test
      'Accept': '*/*',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.15 Safari/537.36',
      'Accept-Encoding': 'gzip, deflate',
      'Accept-Language': 'en-US,en;q=0.8,cs;q=0.6,sk;q=0.4,de;q=0.2',

      'Content-Type': 'application/octet-stream',
      'Authorization': 'Bearer '+ accessToken
    },
    encoding: null, //  if you expect binary data
    body: syncRequest
  }, (error, response, body) => {
    console.log('error', error,'body', body);
    if (!error) {
      readSyncRequest(body, cb);
    }
  });

}

function SendSyncRequest(cb) {
  chrome.storage.local.get('tokens', function(container) {
    let accessToken = container.tokens.access_token;
    SendSyncRequestWithAccessToken(accessToken, db, cb);
  });
}

module.exports = {
  SendSyncRequestWithAccessToken: SendSyncRequestWithAccessToken,
  BuildSyncRequest: BuildSyncRequest,
  SendSyncRequest: SendSyncRequest,
  db:db,
  sync: root
};
