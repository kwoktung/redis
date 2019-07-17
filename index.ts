import * as net from "net"
import Command from "./command";
import RedisParse from "./parse";

interface RedisOpts {
  db?: number;
  passwd?: string;
  host: string;
  port: number
}

function slice(target: string, start: number = 0, end?: number): string {
  return String.prototype.slice.call(target, start, end);
}

class Redis {
  options: RedisOpts;
  client?: net.Socket;
  commandQuene: Command[];
  constructor(options: RedisOpts = { port: 6379, host: "127.0.0.1" }) {
    this.options = options;
    this.commandQuene = [];
  }

  public connect(opts?: RedisOpts): Redis {
    const options = { ...this.options, ...opts };
    this.client = net.connect(options.port, options.host, () => {
      if(options.passwd) {
        // AUTH 密码验证
        this.sendCommand(new Command("AUTH", options.passwd))
      }
      if(options.db) {
        // SELECT 数据
        this.sendCommand(new Command("SELECT", options.db))
      }
    });
    this.client.on("data", this.onDataHanlder);
    this.client.on("error", this.onErrorHanlder);
    return this;
  }

  public sendCommand(command: Command): Promise<any> {
    (this.client as net.Socket).write(command.stringify(), (e) => {
      if(e) { return }
      this.commandQuene.push(command);
    });
    return command.promise
  }

  public set(key: string, value: any, ...options: any[]) {
    return this.sendCommand(new Command("SET", key, value, ...options))
  }

  public get(key: string) {
    return this.sendCommand(new Command("GET", key))
  }

  private onDataHanlder = (data: Buffer) => {
    const parser = new RedisParse({
      onParseArray: (dataArr) => {
        const command = this.commandQuene.shift() as Command;
        command.resolve(dataArr)
      },
      onParseErrors: (error) => {
        const command = this.commandQuene.shift() as Command;
        command.resolve(error)
      },
      onParseBulkSring: (bulkString) => {
        const command = this.commandQuene.shift() as Command;
        command.resolve(bulkString)
      },
      onParseIntegers: (interger) => {
        const command = this.commandQuene.shift() as Command;
        command.resolve(interger)
      },
      onParseStrings: (data) => {
        const command = this.commandQuene.shift() as Command;
        command.resolve(data)
      }
    })
    parser.parse(data.toString())
  }
  private onErrorHanlder(e: Error){
    console.error(`redis client got error message ${e.message}`)
  }
}

export default Redis

