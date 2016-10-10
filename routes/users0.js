/**
 * USERS routes
 *
 * Handle both synchronous and asynchronous requests (Ajax). 
 */

var express = require('express');
var urlBack = require('url-back');
var router = express.Router();

var models = require('../models');

// Configuration
var conf = {
  index: '/users',
  viewsDir: 'users/'
};

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
 */

/* GET / index (list users) */
router.get('/', function(req, res, next) {
  var back = urlBack(req);
  req.session.userForm = null;
  models.User.find(function(err, users) {
    if (err) return next(err);
    // Duplicate xss method because we could need one in front and another one in back view
    req.xhr ?
      res.json({users: models.xssFilterModels(users, 'inHTMLData')}) :
      res.render(conf.viewsDir + 'users', {csrfToken: req.csrfToken(), title: 'Users list', users: models.xssFilterModels(users, 'inHTMLData'), back: back});
  });
})

/* GET /new new (show 'sign in' form) */
.get('/new', function(req, res, next) {
  var userForm = req.session.userForm || null;
  if (userForm) userForm.user = models.xssFilterModel(userForm.user, 'inDoubleQuotedAttr');
  res.render(conf.viewsDir + 'new', {csrfToken: req.csrfToken(), title: 'Sign up', userForm: userForm});
})

/* POST / create (create user) */
.post('/', function (req, res, next) {
  // create an instance of User with req.body form fields
  var user = models.bodyHydrate('User', null, req.body);

  user schema uses regex to secure data so an error will occure if data are not safe and no user will be saved
  user.save(function(err) {
    if (req.xhr) user = models.xssFilterModel(user, 'inHTMLData'); // secure AJAX response
    if (err) {
      req.session.userForm = {user: user, errors: err.errors};
      req.xhr ?
        res.json(req.session.userForm) :
        res.redirect(conf.viewsDir + 'new');
    } else {
      req.session.userForm = null;
      req.xhr ?
        res.json({user: user}) :
        res.redirect(conf.index);
    }
  });
})

/* GET /:id show (show user with id 'id') */
.get('/:id', function(req, res, next) {
  var id = req.params.id;
  if (models.isValidId(id)) {
    models.User.findById(id, function(err, user) {
      if (err) return next(err);
      req.xhr ?
        res.json({user: models.xssFilterModel(user, 'inHTMLData')}) :
        res.render(conf.viewsDir + 'show', {title: "Show", user: models.xssFilterModel(user, 'inDoubleQuotedAttr')});
    });
  } else {
    req.xhr ?
      res.json({errors: 'Invalid user ID'}) :
      res.redirect(conf.index);
  }
})

/* GET /:id/edit edit (edit user with id 'id') */
.get('/:id/edit', function(req, res, next) {
  var id = req.params.id;

  if (models.isValidId(id)) {
    var userForm = req.session.userForm || null;
    if (userForm) {
      userForm.user = models.xssFilterModel(userForm.user, 'inDoubleQuotedAttr');
      req.xhr ?
        res.json(userForm) :
        res.render(conf.viewsDir + 'edit', {csrfToken: req.csrfToken(), title: "Edit", userForm: userForm});
    } else {
      models.User.findById(id, function(err, user) {
        if (err) return next(err);
        req.xhr ?
          res.json({user: models.xssFilterModel(user, 'inDoubleQuotedAttr')}) :
          res.render(conf.viewsDir + 'edit', {csrfToken: req.csrfToken(), title: "Edit", user: models.xssFilterModel(user, 'inDoubleQuotedAttr')});
      });
    }
  } else {
    req.xhr ?
      res.json({errors: 'Invalid user ID'}) :
      res.redirect(conf.index);
  }
})

/* PUT /:id update (update user with id 'id') */
.put('/:id', function(req, res, next) {
  var id = req.params.id;

  if (models.isValidId(id)) {
    models.User.findById(id, function(err, user) {
      if (err) return next(err);
      if (user) {
        user = models.bodyHydrate('User', user, req.body);
        user.save(function(err) {
          if (req.xhr) user = models.xssFilterModel(user, 'inHTMLData'); // secure AJAX response
          if (err) {
            req.session.userForm = {user: user, errors: err.errors};
            req.xhr ?
              res.json(req.session.userForm) :
              res.redirect(user._id + '/edit');
          } else {
            req.session.userForm = null;
            req.xhr ?
              res.json({user: user}) :
              res.redirect(conf.index);
          }
        });
      } else {
        req.xhr ?
          res.json({errors: 'No user found'}) :
          res.redirect(conf.index);
      }
    });
  } else {
    req.xhr ?
      res.json({errors: 'Invalid user ID'}) :
      res.redirect(conf.index);
  }
})

/* DELETE /:id delete (delete user with id 'id') */
.delete('/:id', function(req, res, next) {
  var id = req.params.id;

  if (models.isValidId(id)) {
    models.User.findByIdAndRemove(id, function(err, user) {
      if (err) return next(err);
      if (user) {
        req.xhr ?
          res.json({user: models.xssFilterModel(user, 'inHTMLData')}) :
          res.redirect(conf.index);
      } else {
        req.xhr ?
          res.json({errors: 'No user found'}) :
          res.redirect(conf.index);
      }
    });
  } else {
    req.xhr ?
      res.json({errors: 'Invalid user ID'}) :
      res.redirect(conf.index);
  }
});

module.exports = router;
