'use strict';
function inBrowser() {
  return typeof window !== 'undefined';
}

let request = inBrowser() ?
  require('./libs/browser-request-yegodz'):
  require('request');



let ProtoBuf = require("protobufjs");
let syncProto = require('./sync.proto');
let root = ProtoBuf.loadProto(syncProto).build('sync_pb');

let db = require('./db');
let config = require('./config');


let url = 'https://clients4.google.com/chrome-sync/command';


let my_entry; // debug TODO

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

function fillSyncState(clientToServerMessage, db) {
  let syncState = db.syncState;
  if (syncState) {
    if(syncState.server_chips) {
      clientToServerMessage.bag_of_chips = new root.ChipBag({'server_chips': syncState.server_chips});
    }

    if(syncState.store_birthday) {
      clientToServerMessage.store_birthday = syncState.store_birthday;
    }
  }
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


  fillSyncState(request, db);

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

function SendAuthorizedHttpRequest(accessToken, body) {
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


function parseOpenTabs(ClientToServerResponseItem) {
  if (ClientToServerResponseItem.toString().length < 1000) { //todo
    console.log('******read (toString)******');
    console.log(ClientToServerResponseItem.toString());
  }
  let openTabs = [];
  let decoded = root.ClientToServerResponse.decode(ClientToServerResponseItem);
  let entries = decoded.get_updates.entries;

  entries.forEach( (entry, key) => {
    let tab =  entry.specifics.session.tab;
    if (tab) {
      if (key == entries.length - 2) { // todo
        my_entry = entry;
      }
      let navigation = tab.navigation;
      let lastNavigation = navigation[navigation.length - 1]; // redirects + tab history
      console.log(entry.version.toString(), lastNavigation.virtual_url);

      openTabs.push(lastNavigation.virtual_url);

    }
  });
  openTabs.reverse();
  return openTabs;
}


/**
 * Sends and processes a request to chrome sync server.
 * @param accessToken (uses, if supplied, otherwise used the saved one.
 * @param request {ArrayBuffer} request to be sent
 * @param processor {Function} Processes the response
 * @returns Promise
 * @constructor
 */
function ProcessRequest(accessToken, request, processor) {
  return getAccessTokenPromise(accessToken)
    .then(accessToken => {
      let req = new Uint8Array(request);
      return SendAuthorizedHttpRequest(accessToken, req)
    })
    .then(processor)
    .catch(error => console.log(error));
}

function GetOpenTabs(accessToken) {
  return ProcessRequest(accessToken, BuildSyncRequest(db), parseOpenTabs);
}



// .....................
// UPDATE
function BuildUpdateRequest(websiteUrl) {
  //console.log(my_entry);

  // it's only 13 digits in comparison to 16 used by chrome, hence the multiplication...
  let currentTime = Date.now() * 1000;
  console.log('----', currentTime);
  let request = new root.ClientToServerMessage({
    share: db.getUserShare(),
    message_contents: 'COMMIT',
    commit: {
      config_params: {
        enabled_type_ids: [50119]
      },
      entries: [{
        name: 'Tomass-MacBook-Pro', // TODO save to database
        version: currentTime,
        specifics: {
          session: {
            tab: {
              tab_id: 163,
              window_id: 1,
              navigation: [
                {virtual_url: 'http://MNOUPRIDANE.com/'}
              ]
            }
          }
        }
      }]
    }
  });


  fillSyncState(request, db);
  return request.toArrayBuffer();
}

function updateProcessor(ClientToServerResponseItem) {
  let decoded = root.ClientToServerResponse.decode(ClientToServerResponseItem);
  console.log(decoded);

  let commitResponse = decoded.commit;
  console.log(commitResponse);

  return 'processed updateprocessor';
  //return parseOpenTabs(res);
}

function addOpenTab(websiteUrl, accessToken) {
  return ProcessRequest(accessToken, BuildUpdateRequest(websiteUrl), updateProcessor);
}

module.exports = {
  addOpenTab: addOpenTab,
  GetOpenTabs: GetOpenTabs,
  BuildUpdateRequest: BuildUpdateRequest,
  url: url
};
