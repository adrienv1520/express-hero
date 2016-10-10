/**
 * User Mongoose MongoDB Model linked to a specific db
 *
 * Form validations are treated here (triming, matching, etc.)
 */
var mongoose = require('mongoose');

// Get the Mongoose Connection object to link Model to this db (use case of multiple databases)
var db = require('./db');

// User Schema
var userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    match: [/^\S+[A-Za-z]{2,24}\S+$/, "Firstname must be alphanumeric and at least 2 characters other than blank spaces."],
    required: 'Your firstname is needed'
  },
  lastname: {
    type: String,
    match: [/^\S+[A-Za-z]{2,24}\S+$/, "Lastname must be alphanumeric and at least 2 characters other than blank spaces."],
    required: 'Your lastname is needed'
  },
  email: {
    type: String,
    required: 'An email is needed',
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
  }
});

// User Model specific to db
var User = db.model('User', userSchema);

module.exports = User;
