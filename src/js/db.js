/**
 * Created by tomasnovella on 7/21/15.
 */
'use strict';

let ProtoBuf = require('protobufjs');

let db = {
  getUserShare: () => 'tomasnovella@gmail.com',
  getSyncState: function() {
    return { // part of ClientToServerMessage
      server_chips: null,
      store_birthday: null
    }
  },
  getSyncProgress: function(DataTypeId) { // return DataTypeProgressMarker
    return {
      notification_hint: '__DUMMY',
      timestamp_token_for_migration: 0,
      token: null
    }
  }
};

module.exports = db;
