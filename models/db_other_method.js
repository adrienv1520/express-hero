var mongoose = require('mongoose');

/* db object */
var db = {
  _user: process.env.MONGO_USER || "",
  _pass: process.env.MONGO_PASS || "",
  _host: process.env.MONGO_HOST || "",
  _db: process.env.MONGO_DB || "",
  _connected: false,
  _connection: null
};

/* set complete uri to mongodb database */
db._uri = 'mongodb://' + db._user + ':' + db._pass + db._host + db._db;

/**
 * FUNCTION CONNECT
 * Set a MongoDB Connection object to db._connection
 *
 * @param  {Function} done send error to callback for asynchronous treatment
 *
 * var db = require('./models/db')
 * db.connect(function(err, connected){
 *   if (err) {
 *     console.error(err);
 *     process.exit(1);
 *   } else if (connected){
 *     debug(connected);
 *   }
 * });
 */
module.exports.connect = function(done) {
  if (db._connected) {
    return done(null, 'Already connected to database');
  }

  db._connection = mongoose.createConnection(db._uri, function(err) {
    if (err) return done(err);
    db._connected = true;
    done();
  });
};

/**
 * FUNCTION CLOSE
 * Close the db connection
 *
 * @param  {Function} done send error to callback for asynchronous treatment
 */
module.exports.close = function(done) {
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
 * @return {Connection} MongoDB Connection object
 */
module.exports.get = function() {
  return db._connection;
};
