winston-nedb
============

A NeDB transport for [winston](https://github.com/winstonjs/winston).

## Examples

```js
import WinstonNeDB from '@kothique/winston-nedb';
import { createLogger } from 'winston';
    
const logger = createLogger({
  transports: new WinstonNeDB({
    filename: '/tmp/somelog',
    compact: true
  })
});
    
logger.log('warn', 'meow');
```

### Documentation

#### Class: NeDB

##### `new NeDB([options])`

- `options` {object?}
  - `filename` {string?} Path to the NeDB datastore. In-memory storage will be used, if left empty.
  - `compact` {boolean} Default: false. If true, will run compaction on every log removal (e.g. on rotation).

##### `rotate(interval)`

Remove all log entries with timestamp less than or equal to `interval`ms before now. Return a promise with the number of entries removed. Throws if NeDB's `Datastore#remove()` throws.

## TODO

- Allow indexing based on any field (and multiple fields?)
- Check if autocompact is integer (or it works with float?) AND set a minimum
- Implement capped size
- Set multiple timestamp choices (epoch OR date OR ??)
- More examples
