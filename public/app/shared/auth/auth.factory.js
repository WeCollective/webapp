var app = angular.module('wecoApp');
app.factory('authFactory', function() {
  var authFactory = {};

  authFactory.isLoggedIn = function() {
    return false;
  };

  return authFactory;
});
