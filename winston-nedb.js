var util = require('util');
var os = require('os');
var Stream = require('stream').Stream;


var Datastore = require('nedb');
var winston = require('winston');

/**
 * @param options (Object) : set of options.
 * filename 	(Optionnal) - string	: if none given, db will not be persistent
 * compact  (Optionnal) - bool : If set to true, every removal of logs will launch a database compaction. Keep in mind that compaction takes a bit of time and is synchronous.
 * timestamp (Optionnal) - bool : Default to true. If false, db will not store timestamps on logs.
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
	if(options.timestamp !== false){
		this.db.ensureIndex({ fieldName: 'timestamp' });
    this.timestamp = true;
	}else{
    this.timestamp = false;
  }
  if(options.compact){
    this.compact = true;
  } 

}
util.inherits(Nedb, winston.Transport);
winston.transports.Nedb = Nedb;
/**
 * Remove all logs older than timestamp;
 * This function is asynchronous except if compact was set to true in options
 * @param timestamp : in milliseconds from current time, logs older than this will be deleted
 * @param callback : function(err,numRemoved);
 */
Nedb.prototype.rotate = function(timestamp,callback){
  var currentTime = new Date().getTime();
  var minTime = currentTime - timestamp;
  this.db.remove({timestamp:{$lt:minTime}},callback);
  self.db.persistence.compactDatafile; //We can do this because compact will be queued by nedb
}

/**
 * Inherit from winston
*/
 

Nedb.prototype.log = function (level, msg, meta, callback){
	var self = this;
	var entry = {
		level : level,
		msg : msg,
		
	};
  if(this.timestamp){
    entry.timestamp= new Date().getTime()
  }
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
  		if(options.from && this.timestamp  && this.timestamp <= options.from){
  			return false;
  		}else if (options.until && this.timestamp && this.timestamp >= options.until){
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

