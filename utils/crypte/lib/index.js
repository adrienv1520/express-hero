/**
 * CRYPTE
 */

/* REQUIRES */
var crypto = require('crypto');
var conf = require('./conf');
var errorHandler = require('./errorHandler');
var debug = require('debug')('express-hero:crypte');

/**
 * SET CRYPTING ENVIRONMENT FROM PROCESS.ENV OR DEFAULTS
 * see denvar node modules and env.json file
 * salt, iv and cipher passwords MUST be specify
 */

var defaults = conf.defaults;

var _salt = {
  password: process.env.SALT_PASS || null,
  hash: process.env.SALT_ALGO || defaults.saltHash
};

var _iv = {
  password: process.env.IV_PASS || null,
  iterations: ~~process.env.IV_ITERATIONS || defaults.iterations,
  keylen: defaults.ivKeylen,
  digest: process.env.IV_DIGEST || defaults.digest
};

var _cipher = {
  cipher: defaults.cipher,
  key: process.env.CIPHER_KEY || null,
};

var _spicy = {
  pepper: process.env.PEPPER_KEY || defaults.pepper,
  chilli: process.env.CHILLI_KEY || defaults.chilli,
  oignon: process.env.OIGNON_KEY || defaults.oignon
};

/**
 * MAIN ENTRY POINT.
 *
 * Check if the crypting environment is set. Throw an error if not.
 */
module.exports = function() {
  var isError = false;
  if (!_salt.password) { debug('Required salt password "SALT_PASS" variable was not found in process.env. Should be loaded from env.json.'); isError = true; }
  if(!_iv.password) { debug('Required initialisation vector "IV_PASS" variable password was not found in process.env. Should be loaded from env.json.'); isError = true; }
  if(!_cipher.key) {
    debug('Required cipher key "CIPHER_KEY" variable was not found in process.env. Should be loaded from env.json.');
    isError = true;
  } else {
    // var cipherBuf = Buffer.from(_cipher.key); TODO update to Node.js 6.0.0
    var cipherBuf = new Buffer(_cipher.key);
    keylen = cipherBuf.length;
    if (keylen !== defaults.cipherKeylen) { debug('Cipher key "CIPHER_KEY" must be a ' + defaults.cipherKeylen + ' bits key not ' + keylen); isError = true; }
  }

  if (isError) throw new Error('Security warning : crypting environnement unset.');
  else debug('Crypting environment set and secure.');
};


/* EXPORTS */
module.exports.defaults = defaults;
module.exports.genKeySync = genKeySync;
module.exports.cryptPassword = cryptPassword;
module.exports.cryptPasswordSync = cryptPasswordSync;
module.exports.decryptPassword = decryptPassword;
module.exports.decryptPasswordSync = decryptPasswordSync;
module.exports.verifyPassword = verifyPassword;
module.exports.verifyPasswordSync = verifyPasswordSync;


/* FUNCTIONS */

/**
 * FUNCTION GENSALTSYNC
 * generate a salt key synchronously
 *
 * @param  {String} hash     see conf.js
 * @param  {String} password
 * @return {Buffer}
 */
function genSaltSync(hash, password) {
  if (!errorHandler({hash: hash, password: password})) {

    var randomBytes = crypto.randomBytes(32);

    return crypto.createHmac(hash, password)
                  .update(randomBytes)
                  .digest();
  } else {
    throw new Error('Security warning, cannot generate a salt key.');
  }
}

/**
 * FUNCTION GENSALT
 * generate a salt key asynchronously
 *
 * @param  {String} hash     see conf.js
 * @param  {String} password
 * @return {Function}         callback function cb(err, salt)
 */
function genSalt(hash, password, cb) {
  if (!errorHandler({hash: hash, password: password})) {

    crypto.randomBytes(32, function(err, buf) {
      if (err) return cb(null, err);

      var salt = crypto.createHmac(hash, password)
                        .update(buf)
                        .digest();
      return cb(null, salt);
    });
  } else {
    cb(null, 'Security warning, cannot generate a salt key.');
  }
}

/**
 * FUNCTION GENKEYSYNC
 * generate a key synchronously with the most secure algorithms only.
 * Also used by ClI
 *
 * @param  {Object} params     must contain password, iterations, keylen, digest, encoding[, saltPassword]
 * @param  {String} password
 * @return {Buffer}

 */
function genKeySync(params) {
  var password = params.password || null,
      iterations = parseInt(params.iterations) || 100000,
      keylen = parseInt(params.keylen) || null,
      digest = params.digest || null,
      encoding = params.encoding || 'binary',
      saltHash = defaults.saltHash,
      saltPassword = params.saltPassword || null;


  if (!errorHandler({password: password, saltPassword: saltPassword, iterations: iterations, keylen: keylen, hash: digest, encoding: encoding})) {

    var salt;
    if (!saltPassword) salt = crypto.randomBytes(32);
    else salt = genSaltSync(saltHash, saltPassword);

    var key = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest);
    if (encoding !== 'binary') key = key.toString(encoding);
    return key.slice(0, keylen);
  } else {
    throw new Error('Security warning, cannot generate a key.');
  }
}

/**
 * FUNCTION GENKEY
 * generate a key asynchronously with the most secure algorithms only.
 *
 * @param  {Object} params     must contain password, iterations, keylen, digest, encoding[, saltPassword]
 * @param  {String} password
 * @return {Function}         callback function cb(err, key)

 */
function genKey(params, cb) {
  var password = params.password || null,
      iterations = parseInt(params.iterations) || 100000,
      keylen = parseInt(params.keylen) || null,
      digest = params.digest || null,
      encoding = params.encoding || 'binary',
      saltHash = defaults.saltHash,
      saltPassword = params.saltPassword || null;


  if (!errorHandler({password: password, saltPassword: saltPassword, iterations: iterations, keylen: keylen, hash: digest, encoding: encoding})) {
    genSalt(saltHash, saltPassword, function(err, salt) {
      if (err) return cb(err, null);

      crypto.pbkdf2(password, salt, iterations, keylen, digest, function(err, key) {
        if (err) return cb(err, null);
        if (encoding !== 'binary') key = key.toString(encoding);
        return cb(null, key.slice(0, keylen));
      });
    });
  } else {
    return cb('Security warning, cannot generate a key.', null);
  }
}


/**
 * FUNCTION CRYPTPASSWORDSYNC
 * crypt a string synchronously
 * @param  {String} passwordString
 * @return {String} A password in hexadecimal encoding
 */
function cryptPasswordSync(passwordString) {
  var iv = genKeySync({password: _iv.password,
                        iterations: _iv.iterations,
                        keylen: _iv.keylen,
                        digest: _iv.digest,
                        saltPassword: _salt.password});

  _timingSync();

  var cipher = crypto.createCipheriv(_cipher.cipher, _cipher.key, iv);
  var encrypted = cipher.update(passwordString, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  var tag = cipher.getAuthTag();

  var randomBytes = crypto.randomBytes(12);

  return tag.toString('hex') + _spicy.pepper + encrypted + _spicy.chilli + iv.toString('hex') + _spicy.oignon + randomBytes.toString('hex');
}

/**
 * FUNCTION CRYPTPASSWORD
 * crypt a string asynchronously
 * @param  {String} passwordString
 * @return {Function} callback function cb(err, encrypted) encrypted is a hexadecimal key
 */
function cryptPassword(passwordString, cb) {
  genKey(
    {
      password: _iv.password,
      iterations: _iv.iterations,
      keylen: _iv.keylen,
      digest: _iv.digest,
      saltPassword: _salt.password
    }, function(err, iv) {
      if (err) return cb(err, null);

      _timingSync();

      var cipher;
      try {
        cipher = crypto.createCipheriv(_cipher.cipher, _cipher.key, iv);
      } catch (e) {
        return cb(e, null);
      }

      var encrypted = cipher.update(passwordString, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      var tag = cipher.getAuthTag();
      var randomBytes = crypto.randomBytes(12);

      return cb(null, tag.toString('hex') + _spicy.pepper + encrypted + _spicy.chilli + iv.toString('hex') + _spicy.oignon + randomBytes.toString('hex'));
    });
}


/**
 * FUNCTION DECRYPTPASSWORDSYNC
 * decrypt a hexadecimal key synchronously
 * @param  {String} hexKey hexadecimal key
 * @return {String|null} content decrypted
 */
function decryptPasswordSync(hexKey) {
  var splitKey = _splitKeyiv(hexKey);

  if (!splitKey) {
    debug('Decrypt password failed. Invalid password key.');
    return null;
  }

  var decipher = crypto.createDecipheriv(_cipher.cipher, _cipher.key, splitKey.iv);
  decipher.setAuthTag(splitKey.tag);
  var decrypted = decipher.update(splitKey.content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * FUNCTION DECRYPTPASSWORD (more robust)
 * decrypt a hexadecimal key synchronously (no need for asynchonous)
 * @param  {String} hexKey hexadecimal key
 * @return {Function} callback cb(err, decrypted)
 */
function decryptPassword(hexKey, cb) {
  var splitKey = _splitKeyiv(hexKey);

  if (!splitKey) return cb(new Error('Hexadecimal key is not valid.'), null);

  var decipher;

  try {
    decipher = crypto.createDecipheriv(_cipher.cipher, _cipher.key, splitKey.iv);
    decipher.setAuthTag(splitKey.tag);
  } catch (e) {
    return cb(e, null);
  }
  var decrypted = decipher.update(splitKey.content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return cb(null, decrypted);
}

/**
 * FUNCTION VERIFYPASSWORDSYNC
 * @param  {String} passwordString password from user input
 * @param  {String} hexKey         hexadecimal key from db
 * @return {Boolean}               true if match
 */
function verifyPasswordSync(passwordString, hexKey) {
  var decrypted = decryptPasswordSync(hexKey);
  return passwordString === decrypted;
}

/**
 * FUNCTION VERIFYPASSWORD
 * @param  {String} passwordString password from user input
 * @param  {String} hexKey         hexadecimal key from db
 * @return {Function}              callback cb(err, match) true if match
 */
function verifyPassword(passwordString, hexKey, cb) {
  decryptPassword(hexKey, function(err, decrypted) {
    if (err) return cb(err, false);
    if (passwordString === decrypted) return cb(null, true);
    else return cb(null, false);
  });
}

/**
 * FUNCTION _SPLITKEYIV
 * get tag, content and iv from hexadecimal keys
 * @param  {String} hexKey a hexadecimal key
 * @return {Object}        {tag: Buffer, content: String (hex), iv: Buffer}
 */
function _splitKeyiv(hexKey) {
  // tag-pepper-content-chilli-iv-oignon-random
  if (!hexKey || typeof (hexKey.valueOf()) !== 'string') return null;

  var tag = null,
      content = null,
      iv = null;

  // get tag
  var arrayKey = hexKey.split(_spicy.pepper);
  if (arrayKey.length === 2) {
    tag = new Buffer(arrayKey[0], 'hex');

    // get content and iv
    hexKey = arrayKey[1];
    arrayKey = hexKey.split(_spicy.chilli);

    if (arrayKey.length === 2) {
      content = arrayKey[0];

      hexKey = arrayKey[1];
      arrayKey = hexKey.split(_spicy.oignon);

      if (arrayKey.length === 2) {
        iv = new Buffer(arrayKey[0], 'hex');
      } else {
        debug('Invalid oignon in password key : ' + hexKey);
        return null;
      }
    } else {
      debug('Invalid chilli in password key : ' + hexKey);
      return null;
    }
  } else {
    debug('Invalid pepper in password key : ' + hexKey);
    return null;
  }

  return {
    tag: tag,
    content: content,
    iv: iv
  }
}

/**
 * FUNCTION _TIMINGSYNC
 * prevent cryptographic timing attacks by alterating timing to crypt a password
 */
function _timingSync() {
  var bytesLength = [8, 16, 32, 64, 128, 256, 512];
  var hash = ['sha1', 'sha256', 'sha512'];

  var randomLength = Math.floor(Math.random() * bytesLength.length);
  var randomHash = Math.floor(Math.random() * hash.length);
  var randomBytes = crypto.randomBytes(bytesLength[randomLength]);
  var randomPass = crypto.randomBytes(16).toString('hex');

  crypto.createHmac(hash[randomHash], randomPass)
                .update(randomBytes)
                .digest();
}
