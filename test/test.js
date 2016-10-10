var assert = require('assert');
var User = require('../src/js/app.js').User;

describe('User', function(){
  describe('constructor', function() {
    it('should have a default name', function(){
      var user = new User('name');
      assert.equal('name', user.name);
    });
  });
});

describe('#sawMovie', function(){
  it('should store movies', function(){
    var user = new User();
    assert.equal(0, user.movies.length);
    user.sawMovie('movie');
    assert.equal(1, user.movies.length);
  });
});

describe('#listMovies', function(){
  it('should list movies', function(){
    var user = new User('Adrien');
    user.sawMovie('movie');
    assert.equal('Adrien has seen movie', user.listMovies());
  });
});
