interface RedisParserOption {
    onParseIntegers?(interger: number): any;
    onParseErrors?(error: string): any;
    onParseStrings?(data: string): any;
    onParseBulkSrings?(bulkString: string): any;
    onParseArray?(dataArr: string[]): any;
}

export default class RedisParser {
    options: RedisParserOption
    constructor(options: RedisParserOption) {
        this.options = options
    }
    public parse(data: string) {
        const lines = data.split("\r\n")
        while (lines.length) {
            const line = lines[0]
            const char = line[0];
            switch (char) {
                case ":": {
                    const interger = this.parseIntegers(line)
                    lines.shift();
                    this.options.onParseIntegers && this.options.onParseIntegers(interger)
                    break;
                }
                case "+": {
                    const data = this.parseStrings(line);
                    lines.shift();
                    this.options.onParseStrings && this.options.onParseStrings(data)
                    break
                }
                case "-": {
                    const message = this.parseErrors(line)
                    lines.shift();
                    this.options.onParseErrors && this.options.onParseErrors(message);
                    break
                }
                case "$": {
                    const bulkString = this.parseBulkString(lines);
                    this.options.onParseBulkSrings && this.options.onParseBulkSrings(bulkString);
                    break
                }
                case "*": {
                    const dataArr = this.parseArray(lines);
                    this.options.onParseArray && this.options.onParseArray(dataArr)
                    break
                }
                default: {
                    lines.shift()
                }
            }
        }
    }
    private parseArray(lines: string[]): any[] {
        const numberData = lines.shift() as string;
        let number = +String.prototype.slice.call(numberData, 1);
        const dataArr = [];
        while (number > 0) {
            const line = lines[0]
            const char = line[0];
            switch (char) {
                case ":": {
                    dataArr.push(this.parseIntegers(line));
                    lines.shift();
                    break;
                }
                case "+": {
                    dataArr.push(this.parseStrings(line));
                    lines.shift();
                    break
                }
                case "$": {
                    dataArr.push(this.parseBulkString(lines))
                    break
                }
            }
            number--;
        }
        return dataArr
    }
    private parseBulkString(lines: string[]): string {
        const numberData = lines.shift() as string;
        const number = String.prototype.slice.call(numberData, 1);
        if (+number >= 0) {
            const bulkString = lines.shift() as string;
            return bulkString
        } else {
            return "" // should return null or undefine instead of empty string
            /**
             * This is called a Null Bulk String. The client library API should 
             * not return an empty string, but a nil object, when the server replies
             *  with a Null Bulk String. For example a Ruby library should return 'nil' 
             * while a C library should return NULL 
             * (or set a special flag in the reply object), and so forth
             * */ 
        }
    }
    private parseIntegers(line: string): number {
        return +String.prototype.slice.call(line, 1)
    }
    private parseErrors(line: string): string {
        return String.prototype.slice.call(line, 5)
    }
    private parseStrings(line: string): string {
        return String.prototype.slice.call(line, 1)
    }
}