'use strict';
let assert = require('assert');
let _ = require('lodash');

let db_mock = {
  clientName: 'Kitt',
  sessionTag: "session_sync123-456789",

  syncEntities: {
    'id_string0': {id_string: 'id_string0', specifics: false},
    'id_string1': {
      'id_string': 'id_string1',
      "version": 0,
      "name": "Kitt",
      "position_in_parent": 0,
      "specifics": {
        "session": {
          "session_tag": "session_sync123-456789",
          "tab": {
            "tab_id": 50,
            "window_id": 150,
            "tab_visual_index": 0,
            "current_navigation_index": 1,
            "navigation": [
              {
                "title": "Hello50/150",
                "virtual_url": "http://google.com/test"
              }
            ]
          }
        }
      }
    },
    'id_string2': {
      'id_string': 'id_string2',
      "version": 0,
      "name": "Kitt",
      "position_in_parent": 0,
      "specifics": {
        "session": {
          "session_tag": "session_sync123-456789",
          "tab": {
            "tab_id": 51,
            "window_id": 150,
            "tab_visual_index": 0,
            "current_navigation_index": 1,
            "navigation": [
              {
                "title": "Hello51",
                "virtual_url": "http://google.com/test"
              }
            ]
          }
        }
      }
    },
    'id_string_of_a_header': {
      "id_string": 'id_string_of_a_header',
      "version": 0,
      "name": "Kitt",
      "position_in_parent": 0,
      "specifics": {
        "session": {
          "session_tag": "session_sync123-456789",
          "tab_node_id": -1,
          "header": {
            "window": [],
            "client_name": "Kitt",
            "device_type": "TYPE_PHONE"
          }
        }
      }
    },
    "Z:ADqtAZy7SBx3aAw4bMqMmgyPux9TG1JJ987uhKdvtU1wFUUoZbTIsWnmLXKHils2naYxig4WvsRZ7ZMvC1eHc5texHwOTNJrLg==": {
      "id_string": "Z:ADqtAZy7SBx3aAw4bMqMmgyPux9TG1JJ987uhKdvtU1wFUUoZbTIsWnmLXKHils2naYxig4WvsRZ7ZMvC1eHc5texHwOTNJrLg==",
      "parent_id_string": "0",
      "version": {
        "low": -1110076096,
        "high": 337425
      },
      "name": "Sessions",
      "non_unique_name": "Sessions",
      "sync_timestamp": {
        "low": -1110076096,
        "high": 337425
      },
      "server_defined_unique_tag": "google_chrome_sessions",
      "specifics": {
        "session": {
          "tab_node_id": -1
        }
      },
      "folder": true,
      "attachment_id": []
    }
  }
};

let entriesManager = require('./entriesManager')(db_mock);

function e(json) {console.log(JSON.stringify(json, null, ' '));}


describe('module for finding entities in the database', function() {
  let tabId = 50;
  let windowId = 150;

  it('should skip through structurally different items', function() {
    let tab = entriesManager.findTab(tabId, windowId);
    assert.strictEqual(_.get(tab, 'specifics.session.tab.navigation[0].title'), "Hello50/150");

    tab = entriesManager.findTab(51, windowId);
    assert.strictEqual(_.get(tab, 'specifics.session.tab.navigation[0].title'), "Hello51");
  });

  it('should return undefined if item not found', function() {
    assert.strictEqual(entriesManager.findTab(99999,5555), undefined);
  });

  it('should find the appropriate header', function() {
    let header = entriesManager.findHeader();
    assert.deepEqual(header.id_string, 'id_string_of_a_header');
  });

  it('should find root id_string', () => {
    assert.equal(entriesManager.findRootIdString(), 'Z:ADqtAZy7SBx3aAw4bMqMmgyPux9TG1JJ987uhKdvtU1wFUUoZbTIsWnmLXKHils2naYxig4WvsRZ7ZMvC1eHc5texHwOTNJrLg==');
  });
});
