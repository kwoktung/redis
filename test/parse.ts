import * as assert from "assert";
import RESParser from "../parser";

const TestCase = [
  ":1\r\n",
  "-ERR unknown command 'foobar'\r\n",
  "+OK\r\r"
]

describe("Parser", function () {
  let result: any;
  let onData = (data: any) => result = data
  const parser = new RESParser({
    onParseArray: onData,
    onParseErrors: onData,
    onParseBulkSrings: onData,
    onParseIntegers: onData,
    onParseStrings: onData,
  });
 
  it("parse \":1\\r\\n\" then result should be 1", function() {
    parser.parse(':1\r\n');
    assert.equal(result, 1)
  })
  it("parse \"-ERR unknown command \"foobar\"\\r\\n\", result should be \"unknown command 'foobar'\"", function() {
    parser.parse("-ERR unknown command 'foobar'\r\n")
    assert.equal(result, "unknown command 'foobar'");
  })
  it(`parse ${JSON.stringify("+OK\r\n")}, result should be "OK"`, function() {
    parser.parse('+OK\r\n')
    assert.equal(result, "OK");
  })
  it(`parse ${JSON.stringify("$6\r\nfoobar\r\n")}, result should be foobar`, function() {
    parser.parse('$6\r\nfoobar\r\n')
    assert.equal(result, "foobar");
  })
  it(`parse ${JSON.stringify("$0\r\n\r\n")}, result should be ""`, function() {
    parser.parse('$0\r\n\r\n')
    assert.equal(result, "");
  })
  it(`parse ${JSON.stringify("$-1\r\n")}, result should be ""`, function() {
    parser.parse('$-1\r\n')
    assert.equal(result, "");
  })
})