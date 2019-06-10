function len(obj: any): number {
  return ("" + obj).length
}

class Command {
  cmd: string;
  args: any[];
  promise: Promise<any>;
  private _resolve?: Function;
  private _reject?: Function;

  constructor(cmd: string, ...args: any[]) {
    this.cmd = cmd;
    this.args = args;
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    })
  }

  public stringify(): string {
    let bytes = ""
    bytes += `*${this.args.length+1}\r\n\$${len(this.cmd)}\r\n${this.cmd}\r\n`
    this.args.forEach(e => {
      bytes += `\$${len(e)}\r\n${e}\r\n`
    })
    return bytes
  }
  
  public resolve(data: any){
    (this._resolve as Function)(data);
  }

  public reject(message: string) {
    (this._reject as Function)(message)
  }
}

export default Command