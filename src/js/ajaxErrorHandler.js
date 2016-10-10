(function () {
  "use strict";

  /**
   * AJAX ERROR HANDLER
   *
   * Handles errors from ajax request and/or server side and specific to a model.
   *
   * Typical errors :
   * 	- error sent from AjaxRequest function in vanille.js caught in callback function :
   *  		v.getJSON('/users', function(data, error) {
   *    		if (error) // ... do something
   *      });
   *
   * 	- error(s) sent from db caught in callback object in data object :
   *  		v.getJSON('/users', function(data, error) {
   *    		if (data && data.errors) {
   *      		// show error messages
   *       		for (var error in data.errors) // do something with error.message
   *         	// or access error messages by property name
   *          data.errors['firstname'].message ...
   *        }
   *      });
   */

  /**
   * USER ERROR HANDLER
   * @param  {Object} serverData        data sent from server : should be contains a 'user' object xss-filtered and/or a 'errors' object containing error sub ojects {'email': {'message': 'Email already exists'}, 'firstname': {'message': 'Too long'}}
   * @param  {[type]} serverError       an error sent from AjaxRequest function in vanille.js
   * @return {Boolean}                  returns true if errors have been handled, false if no error found
   */
  module.exports.user = function (serverData, serverError) {
    var hasError = false;
    var errorsMessages = '';

    if (!serverData) {
      hasError = true;
      errorsMessages += '\nNo data sent from server.';
    } else if (serverData.errors) {
      hasError = true;
      var serverDataErrors = serverData.errors;
      for (var prop in serverDataErrors) {
        errorsMessages += '\n' + serverDataErrors[prop].message;
      }
    }

    if (serverError) {
      errorsMessages += '\n' + serverError;
    }
    // do something with error messages
    // ...

    // or access them by serverData.errors[propertyName] ('user' for db errors on user schema(invalid ID, user not found)) and inject in view
    return hasError;
  };

})();
