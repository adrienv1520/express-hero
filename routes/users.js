/**
 * ALFRED
 *
 * USERS controller
 *
 * Only send JSON response to client.
 */

var express = require('express');
var router = express.Router();

var models = require('../models');

var alfred = require('../utils/alfred');

/**
 * API REST (can also be used with express-ressource middleware)
 *
 * GET        /               index (list users)
 * GET        /new            new (show 'sign in' form)
 * POST       /               create (create user)
 * GET        /:id            show (show user with id 'id')
 * GET        /:id/edit       edit (edit user with id 'id')
 * PUT        /:id            update (update user with id 'id')
 * DELETE     /:id            delete (delete user with id 'id')
 * GET        /login          log a user (show login form)
 * POST       /login          submit login form to log user in
 * GET        /logout         logout the user
 */


/* GET / index (list users) TODO DESACTIVATE IN PRODUCTION */
router.get('/', function(req, res, next) {
  models.User.find(function(err, users) {
    if (err) {
      res.json({errors: err.errors});
    } else {
      res.json({users: models.xssFilterModels(users, 'inHTMLData'), csrfToken: req.csrfToken()});
    }
  });
})

/* GET /new new (show 'sign in' form) */
.get('/new', function(req, res, next) {
  // res.json({csrfToken: req.csrfToken()});
  if (req.session.user) {
    res.render('users/', {csrfToken: req.csrfToken(), title: 'Join'});
  } else {
    res.render('users/new', {csrfToken: req.csrfToken(), title: 'Join'});
  }
})

/* POST / create (create user) */
.post('/', function (req, res, next) {
  // create an instance of User with req.body form fields
  var user = models.bodyHydrate('User', null, req.body);

  // user schema uses regex to secure data so an error will occure if data are not safe and no user will be saved
  user.save(function(err) {
    user = models.xssFilterModel(user, 'inHTMLData'); // secure AJAX response
    if (err) {
      res.json({user: user, errors: err.errors});
    } else {
      res.json({user: user});
    }
  });
})

/* GET /:id show (show user with id 'id') */
.get('/:id', alfred.isWelcome, function(req, res, next) {
  var id = req.params.id;
  if (models.isValidId(id)) {
    models.User.findById(id, function(err, user) {
      if (err) {
        res.json({errors: err.errors});
      } else if (user){
        res.json({user: models.xssFilterModel(user, 'inHTMLData')});
      } else {
        res.json({errors: {'user': {message: 'No user found'}}}); // same format than Mongoose err.errors object
      }
    });
  } else {
    res.json({errors: {'user': {message: 'Invalid user ID'}}});
  }
})

/* GET /:id/edit edit (edit user with id 'id') */
.get('/:id/edit', alfred.isWelcome, function(req, res, next) {
  var id = req.params.id;

  if (models.isValidId(id)) {
    models.User.findById(id, function(err, user) {
      if (err) {
        res.json({errors: err.errors});
      } else {
        res.json({user: models.xssFilterModel(user, 'inDoubleQuotedAttr'), csrfToken: req.csrfToken()});
      }
    });
  } else {
    res.json({errors: {'db': {message: 'Invalid user ID'}}});
  }
})

/* PUT /:id update (update user with id 'id') */
.put('/:id', alfred.isWelcome, function(req, res, next) {
  var id = req.params.id;

  if (models.isValidId(id)) {
    models.User.findById(id, function(err, user) {
      if (err) {
        res.json({errors: err.errors});
      } else if (user) {
        user = models.bodyHydrate('User', user, req.body);
        user.save(function(err) {
          user = models.xssFilterModel(user, 'inHTMLData'); // secure AJAX response
          if (err) {
            res.json({user: user, errors: err.errors});
          } else {
            res.json({user: user});
          }
        });
      } else {
        res.json({errors: {'user': {message: 'No user found'}}});
      }
    });
  } else {
    res.json({errors: {'user': {message: 'Invalid user ID'}}});
  }
})

/* DELETE /:id delete (delete user with id 'id') */
.delete('/:id', alfred.isWelcome, function(req, res, next) {
  var id = req.params.id;

  if (models.isValidId(id)) {
    models.User.findByIdAndRemove(id, function(err, user) {
      if (err) {
        res.json({errors: err.errors});
      } else if (user) {
        res.json({user: models.xssFilterModel(user, 'inHTMLData')});
      } else {
        res.json({errors: {'user': {message: 'No user found'}}});
      }
    });
  } else {
    res.json({errors: {'user': {message: 'Invalid user ID'}}});
  }
})

/* GET /login show 'login' form */
.get('/login', function(req, res, next) {
  if (req.sessions.user) {
    res.redirect('users/' + req.session.user._id);
  } else {
    res.render('users/login', {csrfToken: req.csrfToken(), title: 'Login'});
  }
})

/* POST /login log user in */
.post('/login', function(req, res, next) {
  // res.json({csrfToken: req.csrfToken()});
  var pseudo = req.body.pseudo,
      password = req.body.password;

  models.User.findOne({pseudo: pseudo}, function(err, user) {
    if (!user || err) {
      req.session.loginError = 'Invalid pseudo or password';
      res.redirect('/users/login');
    }
    if (user) {
      user.verifyPassword(password, function(err, match) {
        if (!match || err) {
          req.session.loginError = 'Invalid pseudo or password';
          res.redirect('/users/login');
        }
        if (match) {
          req.session.regenerate(function() {
            req.session.user = user;
            req.session.loginSuccess = 'Authenticated';
            res.redirect('/users/' + user._id);
          });
        }
      });
    }
  });

  res.render('users/new', {csrfToken: req.csrfToken(), title: 'Join'});
});

module.exports = router;
