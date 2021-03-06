'use strict';

// Array of DataTypeProgressMarker
// Every datatype (open tabs, bookmarks,...) has it's own progress marker that denotes the state
// of what has been synced
let progressMarkers = [];


let db = {
  // getData -> userShare + sessionTag
  getUserShare: () =>
    new Promise((resolve, reject) =>
      chrome.storage.local.get('userShare', (items) => resolve(items.userShare))),

  setUserShare: (userShare) =>
    new Promise((resolve, reject) => chrome.storage.local.set({'userShare': userShare}, resolve)),

  // static data? updated once, at installation
  //userShare: 'tomasn@salsitasoft.com',

  // clientName: 'Kitt',

  // this tag distinguishes every browser, session. For kitt, let's keep this one
  sessionTag: "session_sync123-456789",


  // updated on every request
  syncState: {
    server_chips: null,
    store_birthday: null //'z00000144-4989-d7ca-0000-000053047d36'
  },

  getProgressMarker: (DataTypeId) => progressMarkers[DataTypeId],
  updateProgressMarker: (DataTypeProgressMarker) =>
    progressMarkers[DataTypeProgressMarker.data_type_id] = DataTypeProgressMarker,

  // syncEntities[<id_string>] = entity
  syncEntities: {}
};

function browserDb(clientName) {
  db.clientName = clientName;
  db.getUserShare = () =>
    new Promise((resolve, reject) =>
      chrome.storage.local.get('userShare', (items) => resolve(items.userShare)));

  db.setUserShare = (userShare) =>
    new Promise((resolve, reject) => chrome.storage.local.set({'userShare': userShare}, resolve));

  return db;
}

function nodeDb(clientName, userShare) {
  db.clientName = clientName;
  db.setUserShare = () => Promise.resolve(userShare);
  db.getUserShare = () => Promise.resolve(userShare);

  return db;
}

module.exports = {
  browserDb,
  nodeDb
};
