# mini-redis

super mini redis client written by nodejs for tour, don't use in production

# completed feature

1. Basic Command, such as get set
2. sub/pub

# usage

`npm i mini-redis`

```
const Redis = require("mini-redis")
const client = new Redis()

client.set('key', 'value');

client.subscribe('channel')
client.on('channel', function(data) {
    // do something with data
})
```
