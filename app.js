if (process.env.NODE_ENV !== 'production') require('denvar').load(process.env.DENVAR || 'development');

// var projectConfig = require('denvar').getNpmConfig('DEV');
// debug('PROJECT CONFIG : ' + JSON.stringify(projectConfig));

// express
var express = require('express');

// middlewares
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var debug = require('debug')('express-hero:app');
var bodyParser = require('body-parser');

var session = require('express-session'); // don't need cookie-parser any more
var MongoDBStore = require('connect-mongodb-session')(session); // MongoDB sessions store for production

// API REST (put/delete override)
var methodOverride = require('method-override');

// performance middleware
var compression = require('compression');

// security middlewares
var csrf = require('csurf');
var helmet = require('helmet');
var crypto = require('crypto');

// routes
var routes = require('./routes/index');
var users = require('./routes/users');

// create express app
var app = express();

// create db connection
var db = require('./models/db');

// listening to database via mongoose events
db.on('open', function() {
  debug('YEAAAH CONNECTED!');
});

db.on('close', function() {
  debug('DB DISCONNECTED!');
});

// setTimeout(function (){
//   db.testConnection();
// }, 2000);
//
// setTimeout(function (){
//   db.disconnect(function(err) {
//     if (err) debug(err);
//   });
// }, 5000);


var crypte = require('./utils/crypte');
crypte(); // set and verify crypting environment

var passwordClear = 'My name is Superman';
// var encrypted = crypte.cryptPasswordSync(passwordClear);
// var bufPass = new Buffer(encrypted, 'hex');
// console.log('encrypted in ' + bufPass.length + ' bits.');
// console.log('PASSWORD CRYPTED : ' + encrypted);
// var decrypted = crypte.decryptPasswordSync(encrypted);
// console.log('PASSWORD DECRYPTED : ' + decrypted);
// console.log('VERIFY PASSWORD ? ' + crypte.verifyPasswordSync(passwordClear, encrypted));
// console.log('PASSWORD : ' + passwordClear + '\nENCRYPTED : ' + encrypted + '\nDECRYPTED : ' + decrypted);

crypte.cryptPassword(passwordClear, function(err, encrypted) {
  if (err) debug(err);
  console.log('PASSWORD ENCRYPTED : ' + encrypted);
  crypte.decryptPassword(encrypted, function(err, decrypted) {
    console.log('PASSWORD DECRYPTED : ' + decrypted);
  });
});

// configure a session key
var key = crypto.createHmac('sha256', 'matvg1525').update('Superman hates cryptonite').digest('hex');

// configure session

// console.time('ms');
// time in ms (TODO module)
var ms = (function() {
  var minute = 60 * 1000,
      hour = 60 * minute,
      day = 24 * hour,
      week = 7 * day,
      month = 30 * day,
      year = 365 * day;
  return {minute : minute, hour: hour, day:day, week: week, month: month, year: year}
})();
// console.timeEnd('ms');

// session configuration
var sess = {
  secret: key,
  cookie: {
    path: '/',
    httpOnly: true,
    secure: false,
    expires: new Date(Date.now() + ms.hour),
    maxAge: ms.hour
  },
  resave: false,
  saveUninitialized: false
};

debug(db.uri());

// session store
var store = new MongoDBStore({
  uri: db.uri(),
  collection: 'mySessions'
});

// catch store errors
store.on('error', function(error){
  if (error) console.error(error);
});

// configure session for production
if (app.get('env') === 'production') {
  // app.set('trust proxy', 1);
  sess.store = store;
  // sess.cookie.secure = true; // secure cookies need https
}
app.use(session(sess));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(express.query());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(csrf());
app.use(methodOverride('_method'));
app.use(helmet());
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression());

// csrf error handler before routes
app.use(function(err, req, res, next){
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  err.status = 403;
  err.message = 'Le jeton de sécurité n\'est pas valide, votre requête ne peut aboutir.';
  next(err);
});

// routes
app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Ressource introuvable');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    console.log('REDIRECT CATCHED IN APP');
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
