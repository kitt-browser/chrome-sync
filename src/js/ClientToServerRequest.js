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


const url = 'https://clients4.google.com/chrome-sync/command';

function fillSyncState(clientToServerMessage, db) {
  let syncState = db.syncState;
  if(syncState.server_chips) {
    clientToServerMessage.bag_of_chips = new root.ChipBag({'server_chips': syncState.server_chips});
  }

  if(syncState.store_birthday) {
    clientToServerMessage.store_birthday = syncState.store_birthday;
  }
}

function sendRequest(accessToken, body) {
  return new Promise((resolve, reject) => {
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
  if (typeof accessToken === 'string') { // for testing
    return Promise.resolve(accessToken);
  } else {
    return new Promise(function(resolve, reject) {
      return chrome.storage.local.get('tokens', resolve)
    }).then(container => container.tokens.access_token);
  }
}

function updateDbFromResponse(db, response) {
  console.log('got response');
  let decodedClientToServerResponse = root.ClientToServerResponse.decode(response);
  let birthday = decodedClientToServerResponse.store_birthday;
  if (birthday.startsWith('birthday_error')) {
    throw new Error('Birthday error: probably you authorized the tokens under different Google account from which you are sending requests.');
  }
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
}

/**
 * Sends the request and processes the response from the chrome sync server.
 * @param accessToken (uses, if supplied, otherwise used the saved one.
 * @param request {Protofuf message} request to be sent
 * @param processor {Function} Processes the response
 * @param db database Used for bag of chips and store birthday
 * @returns Promise
 * @constructor
 */
function processClientToServerRequest(accessToken, request, processor, db) {
  return getAccessTokenPromise(accessToken)
    .then(accessToken => {
      fillSyncState(request, db);
      let req = new Uint8Array(request.toArrayBuffer());
      return sendRequest(accessToken, req)
    })
    .then(response => updateDbFromResponse(db, response))
    .then(processor)
    .catch(error => console.log(error));
}

module.exports = {
  url: url,
  processClientToServerRequest: processClientToServerRequest,
  rootProto: root,
  fillSyncState: fillSyncState, // TODO later on fill it in here.... (+do not export ->not birthday error problem...)
  db: db // TODO remove later on
};
