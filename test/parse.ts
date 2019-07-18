import * as assert from "assert";
import RESParser from "../src/parser";

const TestCase1 = [
  { input:  ":1\r\n", result: 1 },
  { input:  "-ERR unknown command 'foobar'\r\n", result: "unknown command 'foobar'" },
  { input:  "+OK\r\n", result: "OK" },
  { input:  "$6\r\nfoobar\r\n", result: "foobar" },
  { input:  "$0\r\n\r\n", result: "" },
  { input:  "$-1\r\n", result: "" },
  { input:   "*3\r\n$7\r\nmessage\r\n$6\r\nsecond\r\n$5\r\nHello\r\n", result: ['message', 'second', 'Hello'] },
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
 
  it(`parse ${JSON.stringify(TestCase1[0].input)} then result should be ${TestCase1[0].result}`, function() {
    parser.parse(TestCase1[0].input);
    assert.equal(result, TestCase1[0].result)
  })
  it(`parse ${JSON.stringify(TestCase1[1].input)} then result should be ${TestCase1[1].result}`, function() {
    parser.parse(TestCase1[1].input);
    assert.equal(result, TestCase1[1].result)
  })
  it(`parse ${JSON.stringify(TestCase1[2].input)} then result should be ${TestCase1[2].result}`, function() {
    parser.parse(TestCase1[2].input);
    assert.equal(result, TestCase1[2].result)
  })
  it(`parse ${JSON.stringify(TestCase1[3].input)} then result should be ${TestCase1[3].result}`, function() {
    parser.parse(TestCase1[3].input);
    assert.equal(result, TestCase1[3].result)
  })
  it(`parse ${JSON.stringify(TestCase1[4].input)} then result should be ${TestCase1[4].result}`, function() {
    parser.parse(TestCase1[4].input);
    assert.equal(result, TestCase1[4].result)
  })
  it(`parse ${JSON.stringify(TestCase1[5].input)} then result should be ${TestCase1[5].result}`, function() {
    parser.parse(TestCase1[5].input);
    assert.equal(result, TestCase1[5].result)
  })
  it(`parse ${JSON.stringify(TestCase1[6].input)}, then result should be ${TestCase1[6].result}`, function() {
    parser.parse(TestCase1[6].input);
    assert.deepStrictEqual(result, TestCase1[6].result)
  })
})