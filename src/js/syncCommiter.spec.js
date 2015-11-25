'use strict';
let assert = require('assert');
let syncCommiter = require('./syncCommiter');

let db = {
  clientName: 'Kitt',
  sessionTag: "session_sync123-456789"
};
let tabId = 50;
let windowId = 150;


function e(json) {console.log(JSON.stringify(json, null, ' '));}

describe('module for creating and modifying HEADER sync entities(createHeaderSyncEntity, appendRecordsToHeader)', function() {
  it('should create empty entity', function() {
    let entry = syncCommiter.createHeaderSyncEntity(db);
    assert.ok(typeof entry.id_string === 'string');
    delete entry.id_string;

    assert.deepEqual(entry, {
      // "id_string": "Z:rand949215.15602618461448451285459", // random
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
    let entry = syncCommiter.createHeaderSyncEntity(db, tabId, windowId);
    let headerEntry = syncCommiter.appendRecordsToHeader(entry, tabId, windowId);
    delete headerEntry.id_string;
    assert.deepEqual(headerEntry, {
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
    let headerEntry = syncCommiter.createHeaderSyncEntity(db, tabId, windowId);
    headerEntry = syncCommiter.appendRecordsToHeader(headerEntry, tabId, windowId);
    headerEntry = syncCommiter.appendRecordsToHeader(headerEntry, 51, windowId);
    delete headerEntry.id_string;

    assert.deepEqual(headerEntry, {
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
    let headerEntry = syncCommiter.createHeaderSyncEntity(db, tabId, windowId);
    headerEntry = syncCommiter.appendRecordsToHeader(headerEntry, tabId, windowId);
    headerEntry = syncCommiter.appendRecordsToHeader(headerEntry, 51, windowId);
    headerEntry = syncCommiter.appendRecordsToHeader(headerEntry, 51, windowId);
    headerEntry = syncCommiter.appendRecordsToHeader(headerEntry, tabId, windowId);

    delete headerEntry.id_string;

    assert.deepEqual(headerEntry, {
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

describe('module for creating and modifying TAB sync entities(createTabSyncEntity, appendNavigationToTab)', function() {
  it('should create valid empty tab entity', function() {
    let tabEntry = syncCommiter.createTabSyncEntity(db, tabId, windowId);
    assert.ok(typeof tabEntry.id_string === 'string');
    delete tabEntry.id_string;
    delete tabEntry.specifics.session.tab_node_id;
    assert.deepEqual(tabEntry, {
      //"id_string": "Z:rand167410.782771185041448456426382",
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
    let tabEntry = syncCommiter.createTabSyncEntity(db, tabId, windowId);
    delete tabEntry.id_string;
    delete tabEntry.specifics.session.tab_node_id;

    let navigation = {title: 'Hello', url: 'http://google.com/hello'};
    let tabEntryWithAddedNavigation = syncCommiter.appendNavigationToTab(tabEntry, navigation);
    assert.deepEqual(tabEntryWithAddedNavigation, {
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
    assert.deepEqual(syncCommiter.appendNavigationToTab(tabEntryWithAddedNavigation, navigation), {
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
});
