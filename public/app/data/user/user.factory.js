'use strict';

var app = angular.module('wecoApp');
app.factory('User', ['UserAPI', function(UserAPI) {
  var User = {};
  var me = {};

  me = UserAPI.get(); // initial fetch
  User.me = function() {
    return me.data || {};
  };

  User.get = function(username) {
    return new Promise(function(resolve, reject) {
      UserAPI.get({ param: username }).$promise.catch(function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      }).then(function(user) {
        if(user && user.data) {
          resolve(user.data);
        } else {
          // successful response contains no user object:
          // treat as 500 Internal Server Error
          reject(500);
        }
      });
    });
  };

  User.update = function(data) {
    return new Promise(function(resolve, reject) {
      UserAPI.update(data).$promise.catch(function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      }).then(function() {
        resolve();
      });
    });
  };

  // if the user data has a username attribute, we're logged in
  User.isLoggedIn = function() {
    return User.me().username || false;
  };

  User.login = function(credentials) {
    return new Promise(function(resolve, reject) {
      UserAPI.login(credentials).$promise.catch(function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      }).then(function() {
        me = UserAPI.get(function() {
          resolve();
        });
      });
    });
  };

  User.logout = function() {
    return new Promise(function(resolve, reject) {
      UserAPI.logout().$promise.catch(function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      }).then(function() {
        me = UserAPI.get();
        resolve();
      });
    });
  };

  User.signup = function(credentials) {
    return new Promise(function(resolve, reject) {
      UserAPI.signup(credentials).$promise.catch(function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      }).then(function() {
        me = UserAPI.get(function() {
          resolve();
        });
      });
    });
  };

  return User;
}]);
