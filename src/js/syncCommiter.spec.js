'use strict';
let assert = require('assert');
let syncCommiter = require('./syncCommiter');

let db = {
  clientName: 'Kitt',
  sessionTag: "session_sync123-456789",

  syncEntities: {
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
    },
    "Z:ADqtAZyz9kCmlA0OlP8keqBnrOpzmxZhvIfEikGe49P1PsmDbuLNdrlosQkUAWtz1D3wp3koUjtCHUY4DkfpXv+KnIjBKPY9VxAqlNEjR6vgl/ckMY8I8cwGjXT8y/0DavZ7Xn3FAehQhQaxr17o2Ofr5bCB5jktW0phuWSyJA6TlTivGrmADYcNHpHwJUtTur/2lIUAlGvLQhybjFqcM0OsNmMIjNtWnw==": {
      "id_string": "Z:ADqtAZyz9kCmlA0OlP8keqBnrOpzmxZhvIfEikGe49P1PsmDbuLNdrlosQkUAWtz1D3wp3koUjtCHUY4DkfpXv+KnIjBKPY9VxAqlNEjR6vgl/ckMY8I8cwGjXT8y/0DavZ7Xn3FAehQhQaxr17o2Ofr5bCB5jktW0phuWSyJA6TlTivGrmADYcNHpHwJUtTur/2lIUAlGvLQhybjFqcM0OsNmMIjNtWnw==",
      "parent_id_string": "Z:ADqtAZy7SBx3aAw4bMqMmgyPux9TG1JJ987uhKdvtU1wFUUoZbTIsWnmLXKHils2naYxig4WvsRZ7ZMvC1eHc5texHwOTNJrLg==",
      "version": {
        "low": 1042961651,
        "high": 337248
      },
      "mtime": {
        "low": 1066194851,
        "high": 337
      },
      "name": "ST15i",
      "position_in_parent": {
        "low": 0,
        "high": 0
      },
      "originator_cache_guid": "612871367010-n84a6pp7ncnv3eh72fa52dp2hk5sukhc.apps.googleusercontent.com",
      "originator_client_item_id": "Z:rand539207.48783275491448038194492",
      "specifics": {
        "session": {
          "session_tag": "session_sync123-456789",
          "tab": {
            "tab_id": 479,
            "window_id": 437,
            "tab_visual_index": 0,
            "current_navigation_index": 2,
            "navigation": [
              {
                "virtual_url": "http://google.com/mygoogle45",
                "title": "newdeviceSecond breath",
                "page_transition": 1,
                "blocked_state": 1,
                "content_pack_categories": [],
                "obsolete_referrer_policy": 1,
                "navigation_redirect": [],
                "correct_referrer_policy": 1
              },
              {
                "virtual_url": "http://google.com/mygoogle456",
                "title": "Complete refactor rewrite breath",
                "page_transition": 1,
                "blocked_state": 1,
                "content_pack_categories": [],
                "obsolete_referrer_policy": 1,
                "navigation_redirect": [],
                "correct_referrer_policy": 1
              }
            ],
            "variation_id": []
          },
          "tab_node_id": 875071
        }
      },
      "ordinal_in_parent": {
        "buffer": {
          "type": "Buffer",
          "data": "LONGDATA"
        },
        "offset": 135844,
        "markedOffset": -1,
        "limit": 135852,
        "littleEndian": true
      },
      "attachment_id": []
    },
    "Z:ADqtAZyz9kCmlA0OlP8keqBnrOpzmxZhvIfEikGe49P1PsmDbuLNdrlosQkUAWtz1D3wp3koUjtCHUY4DkfpXv+KnIjBKPY9VxAqlNEjR6vgl/ckMY8I8cwGjXT8y/0DavZ7Xn3xwGMVpalgjljg2NMV6WlGfPnlNtXWlO8hkq+uJmMEMaUXPkDPoioUME0wukyD2Qw0dfnyJQe2F0G6rBCVK0lT+BOKYQ==": {
      "id_string": "Z:ADqtAZyz9kCmlA0OlP8keqBnrOpzmxZhvIfEikGe49P1PsmDbuLNdrlosQkUAWtz1D3wp3koUjtCHUY4DkfpXv+KnIjBKPY9VxAqlNEjR6vgl/ckMY8I8cwGjXT8y/0DavZ7Xn3xwGMVpalgjljg2NMV6WlGfPnlNtXWlO8hkq+uJmMEMaUXPkDPoioUME0wukyD2Qw0dfnyJQe2F0G6rBCVK0lT+BOKYQ==",
      "parent_id_string": "Z:ADqtAZy7SBx3aAw4bMqMmgyPux9TG1JJ987uhKdvtU1wFUUoZbTIsWnmLXKHils2naYxig4WvsRZ7ZMvC1eHc5texHwOTNJrLg==",
      "version": {
        "low": 1092972757,
        "high": 337248
      },
      "mtime": {
        "low": 1066244862,
        "high": 337
      },
      "name": "ST15i",
      "position_in_parent": {
        "low": 0,
        "high": 0
      },
      "originator_cache_guid": "612871367010-n84a6pp7ncnv3eh72fa52dp2hk5sukhc.apps.googleusercontent.com",
      "originator_client_item_id": "Z:rand686072.76375405491448038194492",
      "specifics": {
        "session": {
          "session_tag": "session_sync123-456789",
          "header": {
            "window": [
              {
                "window_id": 437,
                "selected_tab_index": 1,
                "browser_type": 1,
                "tab": [
                  479,
                  480
                ]
              }
            ],
            "client_name": "ST15i",
            "device_type": 6
          },
          "tab_node_id": -1
        }
      },
      "ordinal_in_parent": {
        "buffer": {
          "type": "Buffer",
          "data": "LONGDATA"
        },
        "offset": 136408,
        "markedOffset": -1,
        "limit": 136416,
        "littleEndian": true
      },
      "attachment_id": []
    }
  }
};

let tabId = 50;
let windowId = 150;

function e(json) {console.log(JSON.stringify(json, null, ' '));}

describe('module for creating and modifying HEADER sync entities(_createHeader, _appendRecordsToHeader)', function() {
  it('should create empty entity', function() {
    let entry = syncCommiter._createHeader(db);
    assert.ok(typeof entry.id_string === 'string');
    delete entry.id_string;

    assert.deepEqual(entry, {
      // "id_string": "Z:rand949215.15602618461448451285459", // random
      "parent_id_string": "Z:ADqtAZy7SBx3aAw4bMqMmgyPux9TG1JJ987uhKdvtU1wFUUoZbTIsWnmLXKHils2naYxig4WvsRZ7ZMvC1eHc5texHwOTNJrLg==",
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
    });
  });

  it('should test adding new window', function() {
    let entry = syncCommiter._createHeader(db, tabId, windowId);
    let headerEntry = syncCommiter._appendRecordsToHeader(entry, tabId, windowId);
    delete headerEntry.id_string;
    assert.deepEqual(headerEntry, {
      "parent_id_string": "Z:ADqtAZy7SBx3aAw4bMqMmgyPux9TG1JJ987uhKdvtU1wFUUoZbTIsWnmLXKHils2naYxig4WvsRZ7ZMvC1eHc5texHwOTNJrLg==",
      "version": 0,
      "name": "Kitt",
      "position_in_parent": 0,
      "specifics": {
        "session": {
          "session_tag": "session_sync123-456789",
          "tab_node_id": -1,
          "header": {
            "window": [
              {
                "window_id": 150,
                "selected_tab_index": 0,
                "browser_type": "TYPE_TABBED",
                "tab": [
                  50
                ]
              }
            ],
            "client_name": "Kitt",
            "device_type": "TYPE_PHONE"
          }
        }
      }
    });
  });

  it('should test adding new tab to existing window', function() {
    let headerEntry = syncCommiter._createHeader(db, tabId, windowId);
    headerEntry = syncCommiter._appendRecordsToHeader(headerEntry, tabId, windowId);
    headerEntry = syncCommiter._appendRecordsToHeader(headerEntry, 51, windowId);
    delete headerEntry.id_string;

    assert.deepEqual(headerEntry, {
      "parent_id_string": "Z:ADqtAZy7SBx3aAw4bMqMmgyPux9TG1JJ987uhKdvtU1wFUUoZbTIsWnmLXKHils2naYxig4WvsRZ7ZMvC1eHc5texHwOTNJrLg==",
      "version": 0,
      "name": "Kitt",
      "position_in_parent": 0,
      "specifics": {
        "session": {
          "session_tag": "session_sync123-456789",
          "tab_node_id": -1,
          "header": {
            "window": [
              {
                "window_id": 150,
                "selected_tab_index": 1, // this changed
                "browser_type": "TYPE_TABBED",
                "tab": [
                  50, 51 // this changed
                ]
              }
            ],
            "client_name": "Kitt",
            "device_type": "TYPE_PHONE"
          }
        }
      }
    });
  });

  it('should prevent against duplicity when adding the same tab', function() {
    let headerEntry = syncCommiter._createHeader(db, tabId, windowId);
    headerEntry = syncCommiter._appendRecordsToHeader(headerEntry, tabId, windowId);
    headerEntry = syncCommiter._appendRecordsToHeader(headerEntry, 51, windowId);
    headerEntry = syncCommiter._appendRecordsToHeader(headerEntry, 51, windowId);
    headerEntry = syncCommiter._appendRecordsToHeader(headerEntry, tabId, windowId);

    delete headerEntry.id_string;

    assert.deepEqual(headerEntry, {
      "parent_id_string": "Z:ADqtAZy7SBx3aAw4bMqMmgyPux9TG1JJ987uhKdvtU1wFUUoZbTIsWnmLXKHils2naYxig4WvsRZ7ZMvC1eHc5texHwOTNJrLg==",
      "version": 0,
      "name": "Kitt",
      "position_in_parent": 0,
      "specifics": {
        "session": {
          "session_tag": "session_sync123-456789",
          "tab_node_id": -1,
          "header": {
            "window": [
              {
                "window_id": 150,
                "selected_tab_index": 1, // this changed
                "browser_type": "TYPE_TABBED",
                "tab": [
                  50, 51 // this changed
                ]
              }
            ],
            "client_name": "Kitt",
            "device_type": "TYPE_PHONE"
          }
        }
      }
    });
  });
});

describe('module for creating and modifying TAB sync entities(_createTab, appendNavigationToTab)', function() {
  it('should create valid empty tab entity', function() {
    let tabEntry = syncCommiter._createTab(db, tabId, windowId);
    assert.ok(typeof tabEntry.id_string === 'string');
    delete tabEntry.id_string;
    delete tabEntry.specifics.session.tab_node_id;
    assert.deepEqual(tabEntry, {
      //"id_string": "Z:rand167410.782771185041448456426382",
      "parent_id_string": "Z:ADqtAZy7SBx3aAw4bMqMmgyPux9TG1JJ987uhKdvtU1wFUUoZbTIsWnmLXKHils2naYxig4WvsRZ7ZMvC1eHc5texHwOTNJrLg==",
      "version": 0,
      "name": "Kitt",
      "position_in_parent": 0,
      "specifics": {
        "session": {
          "session_tag": "session_sync123-456789",
          // "tab_node_id": 731950, // randomly generated
          "tab": {
            "tab_id": 50,
            "window_id": 150,
            "tab_visual_index": 0,
            "current_navigation_index": 0,
            "navigation": []
          }
        }
      }
    });
  });

  it('should check adding new navigation', function() {
    let tabEntry = syncCommiter._createTab(db, tabId, windowId);
    delete tabEntry.id_string;
    delete tabEntry.specifics.session.tab_node_id;

    let navigation = {title: 'Hello', url: 'http://google.com/hello'};
    let tabEntryWithAddedNavigation = syncCommiter._appendNavigationToTab(tabEntry, navigation);
    assert.deepEqual(tabEntryWithAddedNavigation, {
      "parent_id_string": "Z:ADqtAZy7SBx3aAw4bMqMmgyPux9TG1JJ987uhKdvtU1wFUUoZbTIsWnmLXKHils2naYxig4WvsRZ7ZMvC1eHc5texHwOTNJrLg==",
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
            "current_navigation_index": 1, // changed
            "navigation": [
              { //added
                "title": "Hello",
                "virtual_url": "http://google.com/hello"
              }
            ]
          }
        }
      }
    });

    navigation = {title: 'World', url: 'http://google.com/world'};
    assert.deepEqual(syncCommiter._appendNavigationToTab(tabEntryWithAddedNavigation, navigation), {
      "version": 0,
      "name": "Kitt",
      "parent_id_string": "Z:ADqtAZy7SBx3aAw4bMqMmgyPux9TG1JJ987uhKdvtU1wFUUoZbTIsWnmLXKHils2naYxig4WvsRZ7ZMvC1eHc5texHwOTNJrLg==",
      "position_in_parent": 0,
      "specifics": {
        "session": {
          "session_tag": "session_sync123-456789",
          "tab": {
            "tab_id": 50,
            "window_id": 150,
            "tab_visual_index": 0,
            "current_navigation_index": 2, // changed
            "navigation": [
              {
                "title": "Hello",
                "virtual_url": "http://google.com/hello"
              },
              { // added
                "title": "World",
                "virtual_url": "http://google.com/world"
              }
            ]
          }
        }
      }
    });
  });

  it('should test marking items as defected', () => {
    //console.log(syncCommiter.wipeSessionRequest(db))
  })
});
