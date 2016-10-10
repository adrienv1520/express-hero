/**
 * ALFRED MIDDLEWARE
 *
 * var alfred = require('alfred');
 * app.use(alfred());
 */

var models = require('../../models');

/* client-server login/error communication */
function alfred(req, res, next) {
  var loginError = req.session.loginError,
      loginSuccess = req.session.loginSuccess;

  delete req.session.loginError;
  delete req.session.loginSuccess;

  if (loginError) res.locals.loginError = loginError;
  if (loginSuccess) res.locals.loginSuccess = loginSuccess;

  next();
}

/* is user authenticated */
function isWelcome(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.loginError = 'Access denied, please log in.';
    res.redirect('/users/login');
  }
}

module.exports = alfred;
module.exports.isWelcome = isWelcome;
