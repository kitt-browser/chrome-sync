'use strict';

let _ = require('lodash');


let syncGetter = require('./src/js/syncGetter');
let syncCommiter = require('./src/js/syncCommiter');

let getUpdates = syncGetter.getUpdates;

let db = require('./src/js/db').nodeDb('Kitt', 'tomasn@salsitasoft.com');

function _jsonStringify(json) {
  return JSON.stringify(json, (k, v) => {
    if (k=== 'data')
      return 'LONGDATA';
    if(v===null || v===false)
      return;
    return v;

  }, '  ')
}

let accessToken = "ya29.PgL17CX25x9mK8uoBOWzn-Ik04S6BSu0YyZcIqYSyAQsZSfIUlYtNGFDUg3_bTfh6wJY";

let entries = getUpdates(accessToken, db).then((resp) => {
  //console.error(_jsonStringify(resp));
  console.error(_jsonStringify(db.syncEntities));


  let newTabId = 439;
  let windowId = 437;
  let websiteNavigation = {title:'bugfixed completely new tabOldWindow', url:'http://google.com/mygoogle456'};

  let entries = syncCommiter.createEntriesForAddedNavigation(db, newTabId, windowId, websiteNavigation);

  console.error('******> entries to be commited: open window overview + newTabEntry (the google.com/mygoogle thing)');
  console.error(_jsonStringify(entries));
  console.error('******> response to the commit');

  //return Promise.resolve('Premature ending');

  return syncCommiter.commitEntry(accessToken, db, entries);
}).then((resp)=>console.error('resp', _jsonStringify(resp)), error => console.log(error));
