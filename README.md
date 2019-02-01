winston-nedb
============

A nedb transport for winston

### Usage

#### Available Options

- __filename__ _(Optional)_ - string : if none given, db will not be persistent
- __index__ _(Optional)_ - bool : index db based on timestamp. speed up search on this field
- __compact__ _(Optional)_ - bool : Enable compaction on log rotation. Not really usefull except if you do not plan to delete logs

#### Usage

  import WinstonNeDB from '@kothique/winston-nedb';
  import { createLogger } from 'winston';

  const logger = createLogger({
    transports: new WinstonNeDB({
      filename: '/tmp/somelog',
      compact: true
    })
  });

### Currently supported

- query
- rotate


### Untested but should work

### TODO

- Allow indexing based on any field (and multiple fields?)
- Check if autocompact is integer (or it works with float?) AND set a minimum
- Implement capped size
- Set multiple timestamp choices (epoch OR date OR ??)
