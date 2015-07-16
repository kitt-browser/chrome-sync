var ProtoBuf = require("protobufjs");

var string = require('./complex');
console.log('protodemo', string);
var builder = ProtoBuf.loadProto(string),
  Game = builder.build("Game"),
  Car = Game.Cars.Car;

// Construct with arguments list in field order:
var car = new Car("Rusty", new Car.Vendor("Iron Inc.", new Car.Vendor.Address("US")), Car.Speed.SUPERFAST);

// OR: Construct with values from an object, implicit message creation (address) and enum values as strings:
var car = new Car({
  "model": "Rustyy",
  "vendor": {
    "name": "Iron Inc.",
    "address": {
      "country": "US"
    }
  },
  "speed": "SUPERFAST" // also equivalent to "speed": 2
});

// OR: It's also possible to mix all of this!

// Afterwards, just encode your message:
var buffer = car.encode();



module.exports.car = car;
