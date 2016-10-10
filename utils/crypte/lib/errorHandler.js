/**
 * CRYPTE ERROR HANDLER
 *
 * hash, password, saltPassword, keylen, key, encoding, iterations
 */

var conf = require('./conf');

/**
 * Main entry point.
 */
var errorHandler = function(params){
  var isError = false;
  for (var param in params) {
    if (params.hasOwnProperty(param) && errorHandler[param]) {
      var hasError = errorHandler[param](params[param]); // eg. call function errorHandler.hash(hash)
      if (!isError && hasError) isError = true;
    }
  }
  return isError;
};

// allowed key length, encoding, hash and encryption mode for the strongest security
var allowedKeylen = conf.allowedKeylen;
var allowedEncoding = conf.allowedEncoding;
var allowedHash = conf.allowedHash;
var allowedCipher = conf.allowedCipher;
var minimumIterations = conf.minimumIterations;

errorHandler.hash = function(hash) {
  var isError = false;
  if (!hash) {
    console.error('You must choose a hash to generate the salt key between ' + allowedHash.join(', ') + '.');
    isError = true;
  } else if (!~allowedHash.indexOf(hash)) {
    console.error('Algorithm "' + hash + '" is not supported : ' + allowedHash.join(', ') + '.');
    isError = true;
  }
  return isError;
};

errorHandler.password = function(password) {
  var isError = false;
  if (!password) {
    console.error('You must choose a password for key.');
    isError = true;
  } else if ((password.trim()).length < 5) {
    console.error('Password must be at least 5 characters.');
    isError = true;
  }
  return isError;
}

errorHandler.saltPassword = function(password) {
  var isError = false;
  if (!password) {
    console.error('You must choose a salt password.');
    isError = true;
  } else if ((password.trim()).length < 5) {
    console.error('Password must be at least 5 characters.');
    isError = true;
  }
  return isError;
};

errorHandler.keylen = function(keylen) {
  var isError = false;
  keylen = parseInt(keylen);
  if (Number.isNaN(keylen)) {
    console.error('You must choose a key length between : ' + allowedKeylen.join(', ') + '.');
    isError = true;
  } else if (!~allowedKeylen.indexOf(keylen)) {
    console.error('Key length "' + keylen + '" is not supported : ' + allowedKeylen.join(', ') + '.');
    isError = true;
  }
  return isError;
};

errorHandler.key = function(key) {
  var isError = false;
  if (!key) {
    console.error('You must generate a key with crypte --key in CLI.');
    isError = true;
  } else if (key.constructor.name.toLowerCase() === 'buffer' && !~allowedKeylen.indexOf(key.length)) {
    console.error('Key "' + key.length + '" must be of length : ' + allowedKeylen.join(', ') + ' bits.');
    isError = true;
  }
  return isError;
};

errorHandler.encoding = function(encoding) {
  var isError = false;
  if (!encoding) {
    console.error('You must specify an encoding between ' + allowedEncoding.join(', ') + '.');
    isError = true;
  } else if (!~allowedEncoding.indexOf(encoding)) {
    console.error('Format "' + encoding + '" is not supported : ' + allowedEncoding.join(', ') + '.');
    isError = true;
  }
  return isError;
};

errorHandler.iterations = function(iterations) {
  var isError = false,
  iterations = parseInt(iterations);
  if (Number.isNaN(iterations)) {
    console.error('You must choose a number of iterations : 100000 recommended.');
    isError = true;
  } else if (iterations < minimumIterations) {
    console.error('Number of iterations too small and not safe : ' + iterations + '.');
    isError = true;
  }
  return isError;
};

module.exports = errorHandler;
