/* global suite set bench after */
const { execSync } = require("child_process")
const Redis = require("../")

console.log("==========================");
console.log("redis: " + require("../package.json").version);
var os = require("os");
console.log("CPU: " + os.cpus().length);
console.log("OS: " + os.platform() + " " + os.arch());
console.log("node version: " + process.version);
console.log("current commit: " + execSync("git rev-parse --short HEAD"));
console.log("==========================");

var client;
var waitReady = function(next) {
  client = new Redis();
  next()
};

var quit = function() {
  client.disconnect();
};

suite("Basic Operation", function() {
  set("mintime", 5000);
  set("concurrency", 300);
  before(function(start) {
    waitReady(start);
  });

  bench("INCR foo", function(next) {
    client.incr("foo").then(next);
  });

  bench("DECR foo", function(next) {
    client.decr("foo").then(next);
  });

  after(quit);
});

