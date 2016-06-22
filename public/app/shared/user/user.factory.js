'use strict';

var app = angular.module('wecoApp');
app.factory('User', ['UserAPI', function(UserAPI) {
  var User = {};
  var data = {};

  data = UserAPI.get(); // initial fetch
  User.data = function() {
    return data.data || {};
  };

  // if the user data has a username attribute, we're logged in
  User.isLoggedIn = function() {
    return User.data().username || false;
  };

  User.login = function(credentials) {
    return new Promise(function(resolve, reject) {
      UserAPI.login(credentials).$promise.catch(function(response) {
        reject(response.status);
      }).then(function() {
        data = UserAPI.get(function() {
          resolve();
        });
      });
    });
  };

  User.logout = function() {
    return new Promise(function(resolve, reject) {
      UserAPI.logout().$promise.catch(function(response) {
        reject(response.status);
      }).then(function() {
        data = UserAPI.get();
        resolve();
      });
    });
  };

  return User;
}]);
