import RedisBase from "./base"

const GETTER_METHODS = [
  'GET', 'GETBIT', 'GETRANGE', 'GETSET', 
  'INCR','INCRBY', 'INCRBYFLOAT',
  'DECR','DECRBY',
  'APPEND',
  'BITCOUNT','BITFIELD','BITOP', 'BITPOS', 
  'MGET',
  "EXISTS",
  "DEL"
]
const SETTER_METHODS = [
  'SET', 'SETBIT', 'SETEX', 'SETNX', 'SETRANGE', 'STRLEN',
  'MSET',
  'MSETNX'
]

function addMethods(self: any) {
  GETTER_METHODS.forEach(function(method: string) {
    self.prototype[method.toLowerCase()] = async function(key: string, ...params: any[]) {
      return await this.sendCommand(method, key, ...params)
    }
  })
  
  SETTER_METHODS.forEach(function(method: string) {
    self.prototype[method.toLowerCase()] = function(key: string, ...params: any[]) {
      return this.sendCommand(method, key, ...params)
    }
  })
}

addMethods(RedisBase)

export default RedisBase

