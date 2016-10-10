/**
 * DB.JS
 * Create a connection to a specific database using Mongoose Connection Object
 * (we can manage multiple databases, so rename db.js by a specific name)
 */

var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var debug = require('debug')('express-hero:database');
var xssFilters = require('xss-filters');

/* db object */
var db = {
  _user: process.env.MONGO_USER || '',
  _pass: process.env.MONGO_PASS || '',
  _host: process.env.MONGO_HOST || '',
  _db: process.env.MONGO_DB || '',
  _connected: false,
  _connection: null
};

/* set complete uri to mongodb database */
db._uri = 'mongodb://' + db._user + ':' + db._pass + db._host + db._db;

/**
 * MAIN ENTRY POINT
 * Beware as _connect function returns a Connection Mongoose MongoDB object to not export overriding methods
 * (use alias/namespace instead for example module.exports.close will override the Connection.close method)
 *
 * NOTE : db is first required in app.js that establishes connection, and because modules are caching,
 * 				_connect() function won't be call again, only db._connection Object will be returned when required
 */
module.exports = _connect();

/**
 * PRIVATE FUNCTION _CONNECT
 * Try to make a connection to MongoDB
 * If a db._connection is already done, do not connect again
 *
 * @return {Connection} Mongoose MongoDB Connection object
 */
function _connect() {
  if (!db._connected) {
    db._connection = mongoose.createConnection(db._uri, function(err) {
      if (err) {
        debug(err);
      } else {
        db._connected = true;
        debug('Connected to MongoDB');
      }
    });
  } else {
    debug('Already connected to database');
  }
  return db._connection;
}

/**
 * FUNCTION TESTCONNECTION
 */
module.exports.testConnection = function () {
  _connect();
};

/**
 * FUNCTION DISCONNECT
 * Close the db connection
 *
 * @param  {Function} done send error to callback for asynchronous treatment
 */
module.exports.disconnect = function(done) {
  if (db._connected) {
    db._connection.close(function(err) {
      if (err) return done(err);
      db._connected = false;
      db._connection = null;
      done();
    });
  }
};

/**
 * FUNCTION URI
 *
 * @return {String} uri string connection to database
 */
module.exports.uri = function() {
  return db._uri;
};

/**
 * FUNCTION GET
 * Get the current connection to database
 *
 * @return {Connection} Mongoose MongoDB Connection object
 */
module.exports.get = function() {
  return db._connection;
};
