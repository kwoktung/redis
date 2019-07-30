import * as net from "net"
import EventEmitter from "events"
import Command, { RedisResponse, RedisType } from "./command";
import RedisParser from "./parser";

export interface RedisOpts {
  db?: number;
  passwd?: string;
  autoConnect: boolean;
  host: string;
  port: number;
}

class RedisBase extends EventEmitter {
  options: RedisOpts;
  protected client?: net.Socket;
  protected commandQuene: Command[];
  protected parser: RedisParser;
  protected listening = false;
  constructor(options: RedisOpts = { port: 6379, host: "127.0.0.1", autoConnect: true }) {
    super();
    this.options = options;
    this.commandQuene = [];
    if (options.autoConnect) { this.connect() }
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
  }

  protected send(name: string, ...params: any[]): Promise<RedisResponse> {
    if(!this.client) { throw  new Error("The connnection has not been established yet.") }
    const m = new Command(name, ...params)
    this.client.write(m.toString(), e => {
      if (e) { return }
      this.commandQuene.push(m);
    });
    return m.asPromise()
  }

  protected onDataHanlder = (data: Buffer) => {
    this.parser.parse(data.toString())
  }

  protected onErrorHanlder(e: Error) {
    console.error(`redis client got error message ${e.message}`)
  }

  public disconnect() {
    if (this.client) {
      this.client.end()
    }
  }

  public connect(): RedisBase {
    if (this.client) { return this }
    const options = this.options;
    this.client = net.connect(options.port, options.host, () => {
      if(options.passwd) { this.send("AUTH", options.passwd) }
      if(options.db) { this.send("SELECT", options.db) }
    });
    this.client.on("data", this.onDataHanlder);
    this.client.on("error", this.onErrorHanlder);
    return this
  }

  public async sendCommand(name: string, ...params: any[]): Promise<any> {
    if (this.listening) { return Promise.reject(new Error("instance has been blocked then cannot send message")) }
    const result = await this.send(name, ...params);
    return result.toValue()
  }

  public subscribe(channel: string) {
    this.listening = true;
    return this.send("SUBSCRIBE", channel)
  }

  public psubscribe(channel: string) {
    this.listening = true;
    return this.send("PSUBSCRIBE", channel)
  }

  public async unpsubscribe(channel: string) {
    const { type, arrMsg } = await this.send("PUNSUBSCRIBE", channel);
    if (type == RedisType.Array && arrMsg && arrMsg[2] && +arrMsg[2] == 0) {
      this.listening = false;
    }
  }

  public async unsubscribe(channel: string) {
    const { type, arrMsg } = await this.send("UNSUBSCRIBE", channel);
    if(type == RedisType.Array && arrMsg && arrMsg[2] && +arrMsg[2] == 0) {
      this.listening = false;
    }
  }
}

export default RedisBase

