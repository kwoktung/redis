import * as net from "net"
import EventEmitter from "events"
import Command, { RedisResponse, RedisType } from "./command";
import RedisParser from "./parser";

interface RedisOpts {
  db?: number;
  passwd?: string;
  host: string;
  port: number
}

class Redis extends EventEmitter {
  options: RedisOpts;
  private client: net.Socket;
  private commandQuene: Command[];
  private parser: RedisParser;
  private listening = false;
  constructor(options: RedisOpts = { port: 6379, host: "127.0.0.1" }) {
    super();
    this.options = options;
    this.commandQuene = [];
    this.client = net.connect(options.port, options.host, () => {
      if(options.passwd) { this.send("AUTH", options.passwd) }
      if(options.db) { this.send("SELECT", options.db) }
    });
    this.parser = new RedisParser({
      onParseArray: (dataArr) => {
        if (this.commandQuene.length == 0 && this.listening) {
          if (dataArr[0] == "message") {
            this.emit(dataArr[1], dataArr[2]);
          }
        } else {
          const command = this.commandQuene[0];
          if (command) {
            command.setArr(dataArr);
            this.commandQuene.shift();
          }
        }
      },
      onParseErrors: (error) => {
        const command = this.commandQuene[0];
        if (command) {
          command.setErrMsg(error);
          this.commandQuene.shift();
        }
      },
      onParseBulkSrings: (bulkString) => {
        const command = this.commandQuene[0];
        if (command) {
          command.setBulkMsg(bulkString);
          this.commandQuene.shift();
        }
      },
      onParseIntegers: (interger) => {
        const command = this.commandQuene[0];
        if (command) {
          command.setIntMsg(interger);
          this.commandQuene.shift();
        }
      },
      onParseStrings: (data) => {
        const command = this.commandQuene[0];
        if (command) {
          command.setStrMsg(data);
          this.commandQuene.shift();
        }
      }
    })
    this.client.on("data", this.onDataHanlder);
    this.client.on("error", this.onErrorHanlder);
  }

  private send(name: string, ...params: any[]): Promise<RedisResponse> {
    const m = new Command(name, ...params)
    this.client.write(m.toString(), e => {
      if (e) { return }
      this.commandQuene.push(m);
    });
    return m.asPromise()
  }

  private onDataHanlder = (data: Buffer) => {
    this.parser.parse(data.toString())
  }

  private onErrorHanlder(e: Error) {
    console.error(`redis client got error message ${e.message}`)
  }

  public get(key: string) {
    return this.send("GET", key)
  }

  public set(key: string, value: string) {
    return this.send("SET", key, value)
  }

  public subscribe(channel: string) {
    this.listening = true;
    return this.send("SUBSCRIBE", channel)
  }

  public async unsubscribe(channel: string) {
    const { type, arrMsg } = await this.send("UNSUBSCRIBE", channel);
    if(type == RedisType.Array && arrMsg && arrMsg[2] && +arrMsg[2] == 0) {
      this.listening = false;
    }
  }
}

export default Redis

