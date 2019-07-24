const Redis = require('./redis').default

const RETURN_METHODS = [
    'GET', 'GETBIT', 'GETRANGE', 'GETSET', 
    'INCR','INCRBY', 'INCRBYFLOAT',
    'DECR','DECRBY',
    'APPEND',
    'BITCOUNT','BITFIELD','BITOP', 'BITPOS', 
    'MGET',
    "EXISTS",
    "DEL"
]
const NO_RETURN_METHODS = [
    'SET', 'SETBIT', 'SETEX', 'SETNX', 'SETRANGE', 'STRLEN',
    'MSET',
    'MSETNX'
]

RETURN_METHODS.forEach(function(method) {
    Redis.prototype[String.prototype.toLowerCase.call(method)] = async function(key: string, ...params: any[]) {
        return await this.sendCommand(method, key, ...params)
    }
})

NO_RETURN_METHODS.forEach(function(method) {
    Redis.prototype[String.prototype.toLowerCase.call(method)] = function(key: string, ...params: any[]) {
        this.sendCommand(method, key, ...params)
    }
})

exports = module.exports = Redis
