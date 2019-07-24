
const assert = require("assert")
const Redis = require("../../built") 


describe("Method get/exists", function () {
    let client = new Redis();
    after(function() {
        client.destroy()
    });
    const key = Math.random()
    const value = Math.random()
    client.set(key, value);
    it("get work normal without options", function() {
        return client.get(key).then(function(result) {
            assert.equal(result, value);
        })
    })
    it("exists work normal without options", function() {
        return client.exists(key).then(function(result) {
            assert.equal(result, 1);
        })
    })
    it("del work nornal without option", function() {
        return client.del(key).then(result => {
            assert.equal(result, 1);
        });
    })
    it("after del, exists work normal without options", function() {
        return client.exists(key).then(result => {
            assert.equal(result, 0);
        });
    })
})