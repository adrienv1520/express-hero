/**
 * User Mongoose MongoDB Model linked to a specific db
 *
 * pseudo
 * password
 * loginAttemptsFailed
 * email
 * avatar
 * likedDrawings
 * admin
 * joinDate
 * blocked
 * blockedDate
 *
 * Form validations are treated here (triming, matching, etc.)
 */
var mongoose = require('mongoose');

// Get the Mongoose Connection object to link Model to this db (use case of multiple databases)
var db = require('./db');

// Get Crypte for crypting/decrypting passwords
var crypte = require('../utils/crypte');

// User Schema
var userSchema = new mongoose.Schema({
  pseudo: {
    type: String,
    required: 'Your must choose a pseudo.',
    validate: [
      {
        validator: function (value) {
          return /^\S+[A-Za-z]{2,24}\S+$/.test(value);
        },
        msg: 'Pseudo must be alphanumeric and at least 2 characters other than blank spaces.'
      },
      {
        validator: function (value, respond) {
          var pseudo = this.pseudo;
          var id = this._id;
          User.findOne({pseudo: pseudo}, function(err, user) {
            if (user && !user._id.equals(id)) respond(false);
            else respond(true);
          });
        },
        msg: 'Pseudo already exists.'
      }
    ]
  },
  password: {
    type: String,
    match: [/^\S+[A-Za-z0-9.-_@]{6,24}\S+$/, 'Password should contain at least 6 characters : letters (a to z, upper and lowercase), numbers (0 to 9) and ".", "-", "_" or "@" characters.'],
    required: 'You must choose a password.'
  },
  loginAttemptsFailed: {
    type: Number,
    default: 0
  },
  email: {
    type: String,
    required: 'Your must specify an email in the case of you would forgot your password.',
    validate: [
      {
        validator: function (value) {
          // W3C email regex validation
          // return /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value);
        },
        msg: 'Invalid email.'
      },
      {
        validator: function (value, respond) {
          var email = this.email;
          var id = this._id;
          User.findOne({email: email}, function(err, user) {
            if (user && !user._id.equals(id)) respond(false);
            else respond(true);
          });
        },
        msg: 'Email already exists.'
      }
    ]
  },
  avatar: String,
  likedDrawings: [{type: mongoose.Types.ObjectId, ref: "Drawing"}],
  admin: {
    type: Boolean,
    default: false
  },
  joinDate: {
    type: Date,
    default: new Date()
  },
  blocked: {
    type: Boolean,
    default: false
  },
  blockedDate: Date
});

// pre middlewares

// pre save, crypt password
userSchema.pre('save', function(next) {
  var user = this;
  if (this.isModified('password') || this.isNew) {
    crypte.cryptPassword(user.password, function(err, encrypted) {
      if (err) return next(err);
      user.password = encrypted;
      next();
    });
  } else {
    return next();
  }
});

// verify password, increase login attempts failed in case of failure or reset in case of success
// cb(err, match)
userSchema.methods.verifyPassword = function(password, cb) {
  // if >= 3 attempts to verify password (=login)
  var loginAttemptsFailed = this.loginAttemptsFailed;
  if (loginAttemptsFailed >= 3) {
    if (!this.blocked) {
      this.blocked = true;
      this.blockedDate = new Date();
    } else {
      // we could only block account for a week and check here if one week passed, then reactivate
    }
    cb(new Error('Account blocked : 3 login attempts failed. Please contact us to reactevate your account.')); // TODO calculate date when over (one week after)
  } else {
    crypte.verifyPassword(password, this.password, function(err, match) {
      if (err) return cb(err);

      if (!match) this.loginAttemptsFailed++;
      else this.loginAttemptsFailed = 0;

      return cb(null, match);
    });
  }
};

// User Model specific to db
var User = db.model('User', userSchema);

module.exports = User;
