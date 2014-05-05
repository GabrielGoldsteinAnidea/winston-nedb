var util = require('util');
var os = require('os');
var Stream = require('stream').Stream;


var Datastore = require('nedb');
var winston = require('winston');

/**
 * @param options (Object) : set of options.
 * filename 	(Optionnal) - string	: if none given, db will not be persistent
 * index 		(Optionnal) - bool 		: index db based on timestamp : speed up search
 * autocompact 	(Optionnal) - integer		: Enable autocompaction
 */
var Nedb = exports.Nedb = function (options) {
	options = options || {};

	var self = this;
	this.name = 'nedb';
	this.level = options.level || 'info';
	this.errorTimeout = options.errorTimeout || 10000;
	if(options.filename){
		//DB loading is done synchronously!
		this.db = new Datastore({filename:filename,autoload:true});
	}else{
		this.db = new Datastore();
	};
	if(options.index === true){
		this.db.ensureIndex({ fieldName: 'timestamp' });
	}
	if(options.autocompact && typeof options.autocompact === 'number'){ 
		this.db.persistence.setAutocompactionInterval(options.autocompact);
	}
	this.capped       = options.capped;
  	this.cappedSize   = options.cappedSize || 10000000;

}
/**
 * Inherit from winston
*/
 util.inherits(Nedb, winston.Transport);
 winston.transports.Nedb = Nedb;

Nedb.prototype.log = function (level, msg, meta, callback){
	var self = this;
	var entry = {
		level : level,
		msg : msg,
		timestamp: Math.round(new Date().getTime() / 1000)
	};
	//If provided, metadata is added, nested in .meta property
	if ( meta ) {
       entry.meta = meta;
   	}
    //Store it in db
    this.db.insert(entry,callback);
}

/**
 * @param options : Object - as defined by winston guidelines
   var options = {
    from: timestamp,
    until: timestamp,
    limit: integer,
    start: integer,
    order: 'desc' / 'asc',
    fields: ['message'], etc... 
  };
 * @param callback : function(err,doc) - array of log lines matching query
 */
Nedb.prototype.query = function (options, callback){
	if (typeof options === 'function') {
    	callback = options;
    	options = {};
  	}
  	var count = 0;
  	var query={$where : function(){
  		if(options.from && this.timestamp <= options.from){
  			return false;
  		}else if (options.until && this.timestamp >= options.until){
  			return false;
  		}else {
  			return true;
  		}
  	}};
  	var res = this.db.find(query);
  	if(options.order == 'asc'){
  		res.sort({timestamp: 1, msg: 1});
  	}else{
  		res.sort({timestamp: -1, msg: -1});
  	}


  	if(options.start){
  		res.skip(options.start);
  	}
  	if(options.limit){
  		res.limit(options.limit);
  	}

  	res.exec(callback);
}

