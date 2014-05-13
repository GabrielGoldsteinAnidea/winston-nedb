winston-nedb
============

A nedb transport for winston

###Usage

####Available Options

- __filename__ _(Optionnal)_ - string : if none given, db will not be persistent
- __index__ _(Optionnal)_ - bool : index db based on timestamp. speed up search on this field
- __compact__ _(Optionnal)_ - bool : Enable compaction on log rotation. Not really usefull except if you do not plan to delete logs

####Usage

    var Nedb = require('../winston-nedb').Nedb;
    var winston = require('winston');
    
    var options = {
        filename:'/tmp/log_db',
        index:true,
        autocompact:false
    }
    var logger = new (winston.Logger)({
        transports: [
            new Nedb(options)
        ]
    });

###Currently supported

basic querying


###Untested but should work

###TODO

- Allow indexing based on any field (and multiple fields?)
- Check if autocompact is integer (or it works with float?) AND set a minimum
- Implement capped size
- Set multiple timestamp choices (epoch OR date OR ??)