'use strict';

let _ = require('lodash');

module.exports = (db) =>{
  let entries = db.syncEntities;
  return {
    findHeader() {
      return _.find(entries, {
        specifics: {
          session: {
            session_tag: db.sessionTag,
            header: {}
          }
        }
      });
    },

    findTab(tabId, windowId) {
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
  }
};
