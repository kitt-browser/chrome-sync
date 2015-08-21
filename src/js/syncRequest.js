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
  if(syncState.server_chips) {
    clientToServerMessage.bag_of_chips = new root.ChipBag({'server_chips': syncState.server_chips});
  }

  if(syncState.store_birthday) {
    clientToServerMessage.store_birthday = syncState.store_birthday;
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


/**
 * Sends and processes a request to chrome sync server.
 * @param accessToken (uses, if supplied, otherwise used the saved one.
 * @param request {ArrayBuffer} request to be sent
 * @param processor {Function} Processes the response
 * @param db database Used for bag of chips and store birthday
 * @returns Promise
 * @constructor
 */
function ProcessClientToServerRequest(accessToken, request, processor, db) {
  return getAccessTokenPromise(accessToken)
    .then(accessToken => {
      let req = new Uint8Array(request);
      return SendAuthorizedHttpRequest(accessToken, req)
    })
    .then(response => {
      console.log('got response');
      let decodedClientToServerResponse = root.ClientToServerResponse.decode(response);
      let birthday = decodedClientToServerResponse.store_birthday;
      let new_chips = decodedClientToServerResponse.new_bag_of_chips;
      if (new_chips) {
        new_chips = new_chips.server_chips;
      }
      if (!db.syncState.server_chips || new_chips) {
        db.syncState.server_chips = new_chips;
      }

      if (!db.syncState.store_birthday || birthday) {
        console.log(birthday);
        db.syncState.store_birthday = birthday
      }
      console.log('@@@@@@ bday',  db.syncState.store_birthday);

      return decodedClientToServerResponse;
    })
    .then(processor)
    .catch(error => console.log(error));
}

function GetOpenTabs(accessToken) {
  return ProcessClientToServerRequest(accessToken, BuildSyncRequest(db), parseOpenTabs, db);
}



// .....................
// UPDATE
function BuildUpdateRequest(websiteUrl, db) {
  //console.log(my_entry);

  let currentTime = Date.now();

  // in format "rand271398.372016847131440062545931"
  let randomString = 'rand'+(Math.random()*1000000).toString() + Date.now().toString();

  console.log('----', currentTime);
  let request = new root.ClientToServerMessage({
    share: db.getUserShare(),
    message_contents: 'COMMIT',
    commit: {
      //cache_guid: 'random_string',
      config_params: {
        enabled_type_ids: [50119],
        tabs_datatype_enabled: true
      },
      entries: [{ // Sync entity, filled like chrome://sync-internals
        //attachment_id: [],
        //client_defined_unique_tag: 'PKNCGfsKowE0Tu+LjuxPe5C05mY=',//randomString,

        // 2* whatever
        //ctime: currentTime,
        //mtime: currentTime,

        name: websiteUrl,
        non_unique_name: websiteUrl,
        // it's only 13 digits in comparison to 16 used by chrome, hence the multiplication...
        version: currentTime * 1000,
        id_string: 'Z:ADqtAZxYtpOdmzFl4Fx/ECWEY2U2xytR+HKbgS6Ud13Bb9BHEPoxUw13MrSWNggmBakjrFWFtkZvaCM9eYPsYvwo8D1I1hlzWw==',
        specifics: {
          "session": {
            //"session_tag": "session_syncJnGGyLEoZ3C+9bWCPbO2QQ==",
            "tab": {
              "navigation": [
                {
                  //"timestamp_msec": "1440073418036",
                  "title": "Organizační struktura / Lucie ŠimůnkováHAHAAHA",
                  //"unique_id": 801,
                  "virtual_url": "http://www.mff.cuni.cz/fakulta/struktura/lide/889MOJUPDATTE.htm"
                }
              ],
              "tab_id": 397,
              "window_id": 1
            },
            //"tab_node_id": 337 // MAY turn out to be important...
          }



        }
      }]
    }
  });

  fillSyncState(request, db);
  return request.toArrayBuffer();
}

function updateProcessor(ClientToServerResponseItem) {
  console.log(ClientToServerResponseItem);

  let commitResponse = ClientToServerResponseItem.commit;
  console.log(commitResponse);

  return 'processed updateprocessor';
  //return parseOpenTabs(res);
}

function addOpenTab(websiteUrl, accessToken) {
  return ProcessClientToServerRequest(accessToken, BuildUpdateRequest(websiteUrl, db), updateProcessor, db);
}

module.exports = {
  addOpenTab: addOpenTab,
  GetOpenTabs: GetOpenTabs,
  BuildUpdateRequest: BuildUpdateRequest,
  url: url
};
