'use strict';

let _ = require('lodash');

let db;
let entries;

function init(db_) {
  db = db_;
  entries = db.syncEntities;
}

function findTab(tabId, windowId) {
  // find silently transforms object into array (ignores the keys) and traverses it
  return _.find(entries, {
    specifics: {
      session: {
        session_tag: db.sessionTag,
        tab: {
          tab_id: tabId,
          window_id: windowId
        }
      }
    }
  });
}

function findHeader() {
  return _.find(entries, {
    specifics: {
      session: {
        session_tag: db.sessionTag,
        header: {}
      }
    }
  });
}

module.exports = {
  init,
  findTab,
  findHeader
};
