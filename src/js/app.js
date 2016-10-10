v(function(){



  var userForm = document.getElementById('userForm');

  console.log('HAS PROPERTY EVENT LISTENER USERFORM ? :' + v.hasProperty('addEventListener', userForm));

  console.log('LIST OF PROPERTIES OF USERFORM : ' + v.getAllProperties(userForm));

  if (Object.getPrototypeOf(userForm).hasOwnProperty('addEventListener')) {
    console.log('has event listener function prop');
  } else {
    console.log('no event listener');
  }



  var u = v('#userForm');
  u.target = 'caca';
  console.log('u : ' + Boolean(u.addEventListener) + 'target : ' + u.target);

  u.onclick = function(e) {
    console.log('hey hey hey');
    e.preventDefault();
  };

  userForm.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('in event submit');
  });

  // var lastname = v('#lastname');
  // console.log('TYPE : ' + v.type(lastname));
  // console.log('LASTNAME LENGTH : ' + lastname.length);
  // console.log('LASTNAME OBJECT : ' + JSON.stringify(lastname));
  // if (lastname.exist()) {
  //   console.log('lastname.id=' + lastname.id);
  //   console.log('lastname.value=' + lastname.value);
  //   console.log('lastname.offset().top=' + lastname.offset().top);
  // }

  // var inputs = v('input');
  // console.log('INPUT LENGTH : ' + inputs.length);
  // if (inputs.exist()) console.log('INPUTS EXIST');
  // console.log('INPUTS : ' + JSON.stringify(inputs));
  // console.log('INPUT 1 : ' + inputs[0].value);

  /* AJAX MOMENTS */

  // var ajaxErrorHandler = require('./ajaxErrorHandler');
  // var handleUserError = ajaxErrorHandler.user;

  /* AJAX */
  // v.ajax({method: 'GET', url: '/users', format: 'JSON'}, function(data, error) {
  //   if (!handleUserError(data, error)) {
  //     if (data.users) {
  //       console.log('GET USERS : ' + JSON.stringify(data));
  //     }
  //     if (data.csrfToken) {
  //       var _csrf = v('#_csrf');
  //       _csrf.value = data.csrfToken;
  //     }
  //   }
  // }, function(progress) {
  //   console.log('PROGRESS : ' + progress.percent + '%'); // useful for large up/downlads
  // });

  /* AJAX GET */
  // v.getJSON('/users', function(data, error) {
  //   if (!handleUserError(data, error)) {
  //     if (data.users) {
  //       console.log('GET USERS : ' + JSON.stringify(data));
  //     }
  //     if (data.csrfToken) {
  //       var _csrf = v('#_csrf');
  //       _csrf.value = data.csrfToken;
  //     }
  //   }
  // }, function(progress) {
  //   console.log('PROGRESS : ' + progress.percent + '%'); // useful for large up/downlads
  // });

  /* AJAX NEW */
  // v.getJSON('/users/new', function(data, error) {
  //   if (!handleUserError(data, error)) {
  //     // afficher le formulaire de création user
  //     if (data.csrfToken) {
  //       var _csrf = v('#_csrf');
  //       _csrf.value = data.csrfToken;
  //     }
  //   }
  // });

  /* AJAX POST */
  // on submit, getJSON /users/new to get csrf, inject it in a hidden input[name=_csrf], get data from form and the csrf will be automatically sent by Ajax post
  // v.post('/users', {firstname: 'Awesome', lastname: 'Bernard', email: 'awesomebernard@gmail.com'}, function(data, error) {
  //   if (!handleUserError(data, error)) {
  //     if (data.user) {
  //       console.log('success post ' + JSON.stringify(data.user));
  //     }
  //   }
  // });

  /* AJAX GET ID */
  // v.getJSON('/users/577c0dd58d55dae101497179', function(data, error) {
  //   if (!handleUserError(data, error)) {
  //     if (data.user) {
  //       console.log('GET USER : ' + JSON.stringify(data.user));
  //     }
  //   }
  // });

  /* AJAX EDIT */
  // v.getJSON('/users/577c0dd58d55dae101497179/edit', function(data, error) {
  //   if (!handleUserError(data, error)) {
  //     // afficher le formulaire de modification user
  //     if (data.csrfToken) {
  //       var _csrf = v('#_csrf');
  //       _csrf.value = data.csrfToken;
  //     }
  //   }
  // });

  /* AJAX PUT */
  // v.put('/users/577c0dd58d55dae101497179', {firstname: 'Incredible', lastname: 'Bernard', email: 'awesomebernard@gmail.com'}, function(data, error) {
  //   if (!handleUserError(data, error)) {
  //     if (data.user) {
  //       console.log('success put ' + JSON.stringify(data.user));
  //     }
  //   }
  // });

  /* AJAX DELETE */
  // v.delete('/users/577c0dd58d55dae101497179', function(data, error) {
  //   if (!handleUserError(data, error)) {
  //     if (data.user) {
  //       console.log('User "' + data.user.firstname + '" has been successfully deleted');
  //     }
  //   }
  // });

});
