'use strict';

let _ = require('lodash');

let db;
let entries;

function init(db_) { // TODO avoid the init function altogether, perhaps?
  db = db_;
  entries = db.syncEntities;
}

function findTab(tabId, windowId) {
  if (_.isEmpty(db)) {
    throw new Error('Uninitialized database!');
  }

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
  if (_.isEmpty(db)) {
    throw new Error('Uninitialized database!');
  }

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
