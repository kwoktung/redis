
import * as assert from "assert";
import Redis from "../../src/redis";

describe("Method get/exists", function () {
    let client = new Redis() as any;
    after(function() {
        client.destroy()
    });
    const key = Math.random()
    const value = Math.random()
    client.set(key, value);
    it("get work normal without options", function() {
        return client.get(key).then(function(result: any) {
            assert.equal(result, value);
        })
    })
    it("exists work normal without options", function() {
        return client.exists(key).then(function(result: any) {
            assert.equal(result, 1);
        })
    })
    it("del work nornal without option", function() {
        return client.del(key).then((result: any) => {
            assert.equal(result, 1);
        });
    })
    it("after del, exists work normal without options", function() {
        return client.exists(key).then((result: any) => {
            assert.equal(result, 0);
        });
    })
})