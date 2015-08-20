/**
 * Created by tomasnovella on 7/21/15.
 */
'use strict';

let ProtoBuf = require('protobufjs');

let db = {
  getUserShare: () => 'tomasn@salsitasoft.com',
  syncState: {
    server_chips: null,
    store_birthday: '' //'z00000144-4989-d7ca-0000-000053047d36'
  },
  getSyncProgress: function(DataTypeId) { // return DataTypeProgressMarker
    return {
      notification_hint: '',
      timestamp_token_for_migration: 0,
      token: ''
    }
  }
};

module.exports = db;
