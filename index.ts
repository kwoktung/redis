import * as net from "net"
import debug from "debug"

const log = debug("redis");

interface RedisOpts {
  db?: number;
  passwd?: string;
  host?: string;
  port?: number
}

function len(obj: any): number {
  return ("" + obj).length
}

function commandBytse(cmd: string, ...args: any[]): string {
  let bytes = ""
  bytes += `*${args.length+1}\r\n\$${len(cmd)}\r\n${cmd}\r\n`
  args.forEach(e => {
    bytes += `\$${len(e)}\r\n${e}\r\n`
  })
  return bytes
}

function slice(target: string, start: number = 0, end?: number): string {
  return String.prototype.slice.call(target, start, end);
}

function readBulk(data: string): string {
  const dataArr = data.split(/\r\n/).filter(i => i)
  return dataArr[dataArr.length - 1];
}

function parseResponse(data: string): any {
  if (data.startsWith("-ERR")) {
    return new Error(slice(data, 5))
  }
  switch (data[0]) {
    case "+":
    case ":": 
      return slice(data).trim();
    case "$":
      return readBulk(data)
    default: 
      return new Error("Redis Response Data Parse Error")
  }
}

class Redis {
  options: RedisOpts;
  private clientPool: net.Socket[];
  constructor(options: RedisOpts = { port: 6379, host: "127.0.0.1" }) {
    this.options = options;
    this.clientPool = []
    process.on("exit", () => {
      this.clientPool.forEach((client) => {
        client.destroy();
      })
    })
  }

  public openConnection(): net.Socket {
    if (this.clientPool.length > 0) {
      return this.clientPool.pop()
    }
    const options = this.options;
    const client = net.connect(options.port, options.host, () => {
      if(options.passwd) {
        this.rawSend(`AUTH ${options.passwd}\r\n`)
      }
      if(options.db) {
        this.rawSend(`SELECT ${options.db}\r\n`)
      }
    });
    return client
  }

  public pushConnection(con: net.Socket) {
    this.clientPool.push(con)
  }
  
  public rawSend(bytes: string): Promise<string> {
    const client = this.openConnection();
    return new Promise((resolve, reject) => {  
      client.write(bytes, (e) => {
        if(e) { reject(e); return }
      })
      client.once("data", (data: Buffer) => {
        resolve(data.toString()),
        this.pushConnection(client)
      })
    })
  }

  public sendCommand(cmd: string, ...args: any[]): Promise<any> {
    let bytes = commandBytse(cmd, ...args);
    log(bytes);
    return this.rawSend(bytes).then(data =>  parseResponse(data))
  }

  public set(key: string, value: any) {
    this.sendCommand("SET", key, value)
  }

  public get(key: string): Promise<any> {
    return this.sendCommand("GET", key)
  }
}

export default Redis

