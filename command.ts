import EventEmitter from "events"

enum RedisType { Integers, Errors, Strings, BulkSrings, Array }
interface RedisResponse {
  type: RedisType,
  integer?: number,
  errMsg?: string,
  strMsg?: string,
  bulkMsg?: string,
  array?: string[]
}

class RedisCommand extends EventEmitter {
  private name: string;
  private params: any[];
  private res?: RedisResponse;
  private resolved = false
  constructor(name: string, ...params: any[]) {
    super()
    this.name = name;
    this.params = params;
  }

  public asPromise(): Promise<RedisResponse> {
    return new Promise((resolve) => {
      if (this.resolved) {
        resolve(this.res);
        return;
      } else {
        this.once("RedisResOK", () => {
          this.resolved = true;
          resolve(this.res)
        })
      }
    });
  }

  public setInteger(integer: number) {
    this.res = { type: RedisType.Integers, integer: integer }
    this.emit("RedisResOK")
  }

  public setErrMsg(errMsg: string) {
    this.res = { type: RedisType.Errors, errMsg: errMsg }
    this.emit("RedisResOK")
  }

  public setStrMsg(strMsg: string) {
    this.res = { type: RedisType.Strings, strMsg }
    this.emit("RedisResOK")
  }

  public setBulkMsg(bulkMsg: string) {
    this.res = { type: RedisType.BulkSrings, bulkMsg }
    this.emit("RedisResOK")
  }

  public setArr(arr: string[]) {
    this.res = { type: RedisType.Array, array: arr }
    this.emit("RedisResOK")
  }

  public toString(): string {
    const len = (i:any) => ("" + i).length
    let bytes = `*${this.params.length+1}\r\n\$${len(this.name)}\r\n${this.name}\r\n`
    this.params.forEach(e => {
      bytes += `\$${len(e)}\r\n${e}\r\n`
    })
    return bytes
  }
}

export default RedisCommand