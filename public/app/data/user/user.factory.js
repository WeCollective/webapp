'use strict';

var app = angular.module('wecoApp');
app.factory('User', ['UserAPI', '$http', 'ENV', function(UserAPI, $http, ENV) {
  var User = {};
  var me = {};

  // fetch the presigned url for the profile picture for the specified user,
  // defaulting to authd user if not specified.
  // Returns the promise from $http.
  function getProfilePictureUrl(username) {
    // if no username specified, fetch self
    if(!username) {
      username = 'me';
    }
    // fetch signedurl for user profile picture and attach to user object
    return $http.get(ENV.apiEndpoint + 'user/' + username + '/picture');
  }


  function getMe() {
    return new Promise(function(resolve, reject) {
      // Fetch the authenticated user object
      UserAPI.get().$promise.catch(function() {
        // TODO: handle error
        console.error('Unable to fetch user!');
        reject();
      }).then(function(user) {
        // Attach the profile picture url to the user object if it exists
        getProfilePictureUrl().then(function(response) {
          if(response && response.data && response.data.data) {
            user.data.profileUrl = response.data.data;
          }
          me.data = user.data;
          resolve();
        }, function () {
          // no profile picture to attach
          me.data = user.data;
          resolve();
        });
      });
    });
  }
  getMe();

  // Get authenticated user object
  User.me = function() {
    return me.data || {};
  };

  // Get the specified user object, with attached profile picture url
  User.get = function(username) {
    return new Promise(function(resolve, reject) {
      UserAPI.get({ param: username }).$promise.catch(function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      }).then(function(user) {
        if(user && user.data) {
          getProfilePictureUrl(username).then(function(response) {
            if(response && response.data && response.data.data) {
              user.data.profileUrl = response.data.data;
            }
            resolve(user.data);
          }, function(response) {
            // no profile picture url to attach
            resolve(user.data);
          });
        } else {
          // successful response contains no user object:
          // treat as 500 Internal Server Error
          reject({
            status: 500,
            message: 'Something went wrong'
          });
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
        getMe().then(resolve, reject);
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
        getMe().then(resolve, reject);
      });
    });
  };

  return User;
}]);
