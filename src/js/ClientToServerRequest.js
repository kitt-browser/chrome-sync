'use strict';
function inBrowser() {
  return typeof window !== 'undefined';
}


let request = inBrowser() ?
  require('./libs/browser-request-yegodz'):
  require('request');

let _ = require('lodash');
let config = require('./config');

let root = require("protobufjs").loadProto(require('./sync.proto')).build('sync_pb');


function fillRequestFromDb(clientToServerMessage, db) {
  clientToServerMessage.share = db.getUserShare();

    let syncState = db.syncState;
  if(syncState.server_chips) {
    clientToServerMessage.bag_of_chips = new root.ChipBag({'server_chips': syncState.server_chips});
  }

  if(syncState.store_birthday) {
    clientToServerMessage.store_birthday = syncState.store_birthday;
  }
}

function baseSendRequest(accessToken, body) {
  return new Promise((resolve, reject) => {
    return request.post({
        url: 'https://clients4.google.com/chrome-sync/command',
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
      if (stringBody.length < 10) {
        if (body[1]== 145) {
          reject('401 Unauthorized (probably outdated access token)') ;
        } else if (body[1] == 144) {
          reject('400 Bad Request (probably wrong format of the input)');
        } else {
          reject('Suspiciously short response.');
        }
      }

      if (!error) {
        resolve(body);
      } else {
        reject(body);
      }
    });
  });
}

function getAccessTokenPromise(accessToken) {
  if (!_.isEmpty(accessToken)) { // for testing
    return Promise.resolve(accessToken);
  } else {
    return new Promise(function(resolve, reject) {
      return chrome.storage.local.get('tokens', resolve)
    }).then(container => container.tokens.access_token);
  }
}

function updateDbFromResponse(db, response) {
  let birthday = response.store_birthday;
  if (birthday.startsWith('birthday_error')) {
    throw new Error('Birthday error: probably you authorized the tokens under different Google account from which you are sending requests.');
  }
  let new_chips = response.new_bag_of_chips;
  //console.error('newchips:', response.new_bag_of_chips, 'bday:', response.store_birthday);
  if (new_chips) {
    new_chips = new_chips.server_chips;
  }
  if (!db.syncState.server_chips || new_chips) {
    db.syncState.server_chips = new_chips;
  }

  if (!db.syncState.store_birthday || birthday) {
    db.syncState.store_birthday = birthday
  }

  if (response.get_updates) {
    response.get_updates.new_progress_marker.forEach((marker) => db.updateProgressMarker(marker));
  }


  return response;
}

function _jsonStringify(json) {
  return JSON.stringify(json, (k, v) => {
    if (k=== 'data')
      return 'LONGDATA';
    if(v===null || v===false)
      return;
    return v;

  }, '  ')
}
/**
 * Sends the request and processes the response from the chrome sync server.
 * @param accessToken (uses, if supplied, otherwise used the saved one.
 * @param request {Protofuf message} request to be sent
 * @param db database Used for bag of chips and store birthday
 * @returns Promise
 * @constructor
 */
function sendRequest(accessToken, request, db) {
  return getAccessTokenPromise(accessToken)
    .then(accessToken => {
      fillRequestFromDb(request, db);
      console.error(_jsonStringify(request.toRaw(true, true)));
      let req = new Uint8Array(request.toArrayBuffer());
      return baseSendRequest(accessToken, req)
    })
    .then(response => root.ClientToServerResponse.decode(response))
    .then(d => {
      //console.error(_jsonStringify(d));
      return d;
    })
    .then(decodedResponse => updateDbFromResponse(db, decodedResponse))
}

module.exports = {
  sendRequest,
  rootProto: root,
  getAccessTokenPromise,
  fillRequestFromDb
};
