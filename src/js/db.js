'use strict';

// Array of DataTypeProgressMarker
// Every datatype (open tabs, bookmarks,...) has it's own progress marker that denotes the state
// of what has been synced
let progressMarkers = [];


let db = {
  getUserShare: () => 'tomasn@salsitasoft.com',
  syncState: {
    server_chips: null,
    store_birthday: null //'z00000144-4989-d7ca-0000-000053047d36'
  },

  getProgressMarker: (DataTypeId) => progressMarkers[DataTypeId],
  updateProgressMarker: (DataTypeProgressMarker) =>
    progressMarkers[DataTypeProgressMarker.data_type_id] = DataTypeProgressMarker,

  // syncEntities[<id_string>] = entity
  syncEntities: [],

  clientName: 'Kitt',
  // this tag distinguishes every browser, session. For kitt, let's keep this one
  sessionTag: "session_sync123-456789"

};


module.exports = db;
