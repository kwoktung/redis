import * as assert from "assert";
import Command from "../command";

describe('new Command("SET", "foo", "bar")', function() {
  describe('#toString()', function() {
    it(`should equal to ${JSON.stringify('*3\r\n$3\r\nSET\r\n$3\r\nfoo\r\n$3\r\nbar\r\n')}`, function() {
      const c = new Command("SET", "foo", "bar")
      assert.equal(c.toString(), "*3\r\n$3\r\nSET\r\n$3\r\nfoo\r\n$3\r\nbar\r\n");
    });
  });
});