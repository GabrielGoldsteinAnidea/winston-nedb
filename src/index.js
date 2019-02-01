// var util = require('util');
// var os = require('os');
// var Stream = require('stream').Stream;
//
// var Datastore = require('nedb');
// var winston = require('winston');
//
// /**
//   * @param {object?}  options
//   * @param {string?}  options.filename - If none is given, db will not be persisted.
//   * @param {boolean?} options.compact - Default: false. If true, every removal of logs will launch a database compaction.
//   *                                     Keep in mind that compaction takes a bit of time and is synchronous.
//   * @param {boolean?} options.timestamp - Default: true. If false, db will not store timestamps on logs.
//  */
// var Nedb = exports.Nedb = function Nedb(options = {}) {
//   var filename = options.filename || null;
//   var compact = typeof options.compact === 'boolean' ? options.compact : false;
//   var timestamp = typeof options.timestamp === 'boolean' ? options.timestamp : true;
//
// 	var self = this;
// 	self.name = 'nedb';
// 	self.level = options.level || 'info';
//
// 	if (filename) {
// 		self.db = new Datastore({ filename: filename, autoload: true });
// 	} else {
// 		self.db = new Datastore();
// 	};
//
//   self.timestamp = timestamp;
// 	if (timestamp) {
// 		self.db.ensureIndex({ fieldName: 'timestamp' });
//   }
//
//   self.compact = compact;
// }
// util.inherits(Nedb, winston.Transport);
//
// /**
//  * Remove all logs older than timestamp.
//  * This function is asynchronous except if compact was set to true in options.
//  * @param {number}                    timestamp - In ms since current time.
//  * @param {(err, numRemoved) => void} callback
//  */
// Nedb.prototype.rotate = function rotate(timestamp, callback) {
//   var self = this;
//
//   var currentTime = new Date().getTime();
//   var minTime = currentTime - timestamp;
//   self.db.remove({ timestamp: { $lt: minTime } }, callback);
//   self.db.persistence.compactDatafile; // We can do this because compact will be queued by nedb.
// }
//
// /**
//  * Inherit from winston
// */
//
// /**
//  * @param {object} info
//  * @param {string} message
//  * @param {any} meta - Must be serializable.
//  * @param {(err, newDoc) => void} - Callback.
//  */
// Nedb.prototype.log = function log(level, msg, meta, callback) {
// 	var self = this;
//
// 	var entry = {
// 		level: level,
// 		msg: msg,
// 	};
//
//   if (this.timestamp) {
//     entry.timestamp = new Date().getTime();
//   }
//
// 	/* If provided, metadata is added, nested in .meta property. */
// 	if (meta) {
//     entry.meta = meta;
//  	}
//
//   // Store it in db.
//   this.db.insert(entry, callback);
// }
//
// /**
//  * @param {object?}             options
//  * @param {Date?}               options.from
//  * @param {Date?}               options.until
//  * @param {number?}             options.rows
//  * @param {number?}             options.start
//  * @param {('asc' | 'desc')?}   options.order
//  * @param {string[]?}           options.fields
//  * @param {(err, rows) => void} callback
//  */
// Nedb.prototype.query = function (options, callback) {
// 	if (typeof options === 'function') {
//   	callback = options;
//   	options = {};
// 	}
//
// 	var count = 0;
// 	var query = { $where : function () {
// 		if (options.from && this.timestamp && this.timestamp <= options.from) {
// 			return false;
// 		} else if (options.until && this.timestamp && this.timestamp >= options.until) {
// 			return false;
// 		} else {
// 			return true;
// 		}
// 	}};
//
// 	var cursor = this.db.find(query);
// 	if (options.order === 'asc') {
// 		cursor.sort({ timestamp: 1, msg: 1 });
// 	} else {
// 		cursor.sort({ timestamp: -1, msg: -1 });
// 	}
//
// 	if (options.start) {
// 		cursor.skip(options.start);
// 	}
//
// 	if (options.rows) {
// 		cursor.limit(options.rows);
// 	}
//
// 	cursor.exec(callback);
// }
