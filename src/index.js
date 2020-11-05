if (!global._babelPolyfill) {
	require('@babel/polyfill');
}

import Transport from 'winston-transport';
import Datastore from 'nedb';

export default class NeDB extends Transport {
  /**
    * @param {object?}  options
    * @param {string?}  options.filename - If none is given, db will not be persisted.
    * @param {boolean?} options.compact - Default: false. If true, every removal of logs will launch a database compaction.
    *                                     Keep in mind that compaction takes a bit of time and is synchronous.
   */
  constructor(options = {}) {
    super(options);

    const filename = options.filename || null;
    this._compact = typeof options.compact === 'boolean' ? options.compact : false;

    this.name = 'nedb';

    this._db = filename
      ? new Datastore({ filename, autoload: true })
      : new Datastore;

    this._db.ensureIndex({ fieldName: 'timestamp' });
  }

  /**
   * Remove all logs older than timestamp.
   * This function is asynchronous except if compact was set to true in options.
   * @param {number} timestamp - In ms before current time.
   * @return {Promise<number>} - Number of rows removed.
   * @throws - Errors from Datastore#remove().
   */
  async rotate(ms) {
    const minTime = new Date(Date.now() - ms);

    return new Promise((resolve, reject) => this._db.remove(
      { timestamp: { $lte: minTime } },
      (err, numRemoved) => {
        if (err) { return reject(err); }

        if (this._compact) {
          this._db.persistence.compactDatafile();
        }
        resolve(numRemoved);
      }
    ));
  }

  /**
   * @param {object?}             options
   * @param {Date?}               options.from
   * @param {Date?}               options.until
   * @param {number?}             options.rows
   * @param {number?}             options.start
   * @param {('asc' | 'desc')?}   options.order
   * @param {string[]?}           options.fields
   * @param {(err, res) => void}  callback
   */
  async query(options, callback) {
    options = normalizeQuery(options);

    const count = 0;
    const query = { $where: function () {
      if (options.from && this.timestamp <= options.from) {
        return false;
      } else if (options.until && this.timestamp >= options.until) {
        return false;
      } else {
        return true;
      }
    }};

    const cursor = this._db.find(query);
      if (options.order === 'asc') {
          cursor.sort({ linenum: 1, timestamp: 1, message: 1 });
    } else {
         cursor.sort({ linenum: -1, timestamp: -1, message: -1 });
    }

    if (options.start) {
      cursor.skip(options.start);
    }

    if (options.rows) {
      cursor.limit(options.rows);
    }

    cursor.exec((err, rows) => err ? callback(err) : callback(undefined, rows));
  }

  log(info, callback) {
    const { level, message, linenum, ...meta } = info;

    this._db.insert(
      {
        level,
        message,
        linenum,
        ...meta && { meta },
        timestamp: new Date()
      },
      (err, row) => {
        err ? callback(err) : callback();
        setTimeout(() => this.emit('logged', row));
      }
    );
  }
};
module.exports = NeDB;

/* From winston/transports/file.js */
function normalizeQuery(options) {
  options = options || {};

  // limit
  options.rows = options.rows || options.limit || 10;

  // starting row offset
  options.start = options.start || 0;

  // now
  options.until = options.until || new Date();
  if (typeof options.until !== 'object') {
    options.until = new Date(options.until);
  }

  // now - 24
  options.from = options.from || (options.until - (24 * 60 * 60 * 1000));
  if (typeof options.from !== 'object') {
    options.from = new Date(options.from);
  }

  // 'asc' or 'desc'
  options.order = options.order || 'desc';

  // which fields to select
  options.fields = options.fields;

  return options;
}
