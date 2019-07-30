import * as assert from "assert";
import Command, { RedisResponse } from "../../src/command";
import Redis from "../../src/base";

class MockRedis extends Redis {
    protected send(name: string, ...params: any[]): Promise<RedisResponse> {
        const m = new Command(name, ...params);
        this.commandQuene.push(m);
        return m.asPromise()
    }
    public onData(data: Buffer) {
        this.onDataHanlder(data)
    }
}

describe("Redis Instance", function() {
    const instance = new MockRedis({ port: 6379, host: "127.0.0.1", autoConnect: false })
    const p = instance.sendCommand("GET", "AAA");
    instance.onData(Buffer.from(`$1\r\n1\r\n`))
    it("Redis sendCommand('GET', 'AAA') should return promise with value 1", function(done) {
        p.then(function(result) {
            assert.equal(result, 1)
            done()
        })
    })
})