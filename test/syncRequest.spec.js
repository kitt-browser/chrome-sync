//'use strict';
//let assert = require('assert');
//let ProtoBuf = require("protobufjs");
//let ByteBuffer = ProtoBuf.ByteBuffer;
//
//let syncRequest = require('../src/js/syncRequest');
//let db = require('../src/js/db');
//let syncProto = require('../src/js/sync.proto');
//let builder = ProtoBuf.loadProto(syncProto);
//let root = builder.build('sync_pb');
//
//
//describe('module for syncRequest', function () {
//  it('should sendsyncrequest', function() {
//    //syncRequest.ProcessRequest(db);
//
//    console.log('hhi');
//  });
//
//  it('should verify syncrequest sender', function () {
//    //console.log(root.ClientToServerMessage.decode(syncRequest.BuildSyncRequest(db)));
//
////    let b = new ByteBuffer();
////    b.writeInt(2.5);
////
////    var encoded = new root.DataTypeProgressMarker({'token': b.toString()});
////    console.log(root.DataTypeProgressMarker.decode(encoded.toArrayBuffer()));
//
//    //assert.equal(1, 'ERROR THROWN');
//  });
//});
