import EventEmitter from "events"

export enum RedisType { Integers, Errors, Strings, BulkSrings, Array }

export class RedisResponse {
  type: RedisType;
  intMsg?: number;
  errMsg?: string;
  strMsg?: string;
  bulkMsg?: string;
  arrMsg?: string[]
  constructor(options: {
    type: RedisType,
    intMsg?: number;
    errMsg?: string;
    strMsg?: string;
    bulkMsg?: string;
    arrMsg?: string[]
  }) {
    this.type = options.type
    this.intMsg = options.intMsg
    this.errMsg = options.errMsg
    this.strMsg = options.strMsg
    this.bulkMsg = options.bulkMsg
    this.arrMsg = options.arrMsg
  }
  public toValue() {
    switch (this.type) {
      case RedisType.Errors: {
        return this.errMsg
      }
      case RedisType.Array: {
        return this.arrMsg
      }
      case RedisType.Integers: {
        return this.intMsg
      }
      case RedisType.Strings: {
        return this.strMsg
      }
      case RedisType.BulkSrings: {
        return this.bulkMsg
      }
    }
  }
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

  public setIntMsg(integer: number) {
    this.res = new RedisResponse({ type: RedisType.Integers, intMsg: integer })
    this.emit("RedisResOK")
  }

  public setErrMsg(errMsg: string) {
    this.res = new RedisResponse({ type: RedisType.Errors, errMsg: errMsg })
    this.emit("RedisResOK")
  }

  public setStrMsg(strMsg: string) {
    this.res = new RedisResponse({ type: RedisType.Strings, strMsg })
    this.emit("RedisResOK")
  }

  public setBulkMsg(bulkMsg: string) {
    this.res = new RedisResponse({ type: RedisType.BulkSrings, bulkMsg })
    this.emit("RedisResOK")
  }

  public setArr(arr: string[]) {
    this.res = new RedisResponse({ type: RedisType.Array, arrMsg: arr })
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

export function createCommand(name: string, ...params: string[]) {
  return new RedisCommand(name, ...params);
}

export default RedisCommand