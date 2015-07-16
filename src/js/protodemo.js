var ProtoBuf = require("protobufjs");
var syncProto = require('./sync.proto');

var builder = ProtoBuf.loadProto(syncProto);
