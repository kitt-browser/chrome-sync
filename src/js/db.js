'use strict';

let db = {
  getUserShare: () => 'tomasn@salsitasoft.com',
  syncState: {
    server_chips: null,
    store_birthday: null //'z00000144-4989-d7ca-0000-000053047d36'
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
