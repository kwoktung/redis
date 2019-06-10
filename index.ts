import * as net from "net"
import Command from "./command";

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
    const arr = data.toString().split("\r\n").filter(i => i);
    for(let i = 0, len = arr.length; i < len; i++) {
      const item = arr[i];
      const c = this.commandQuene.shift();
      switch (item[0]) {
        case "+": {
          (c as Command).resolve(slice(item, 1))
        }
        case ":": {
          (c as Command).resolve(slice(item, 1))
        }
        case "-": {
          (c as Command).reject(slice(item, 5))
        }
        case "$": {
          i += 1;
          (c as Command).resolve(arr[i+1])
        }
        default: {
          (c as Command).resolve(item)
        }
      }
    }
  }
  private onErrorHanlder(e: Error){
    console.error("收到错误消息", e.message)
  }
}

export default Redis

