'use strict';

var app = angular.module('wecoApp');
app.factory('User', ['UserAPI', '$http', 'ENV', function(UserAPI, $http, ENV) {
  var User = {};
  var me = {};

  // fetch the presigned url for the profile picture for the specified user,
  // defaulting to authd user if not specified.
  // Returns the promise from $http.
  function getPictureUrl(username, type, thumbnail) {
    // if no username specified, fetch self
    if(!username) {
      username = 'me';
    }

    // if type not specified, default to profile picture
    if(type != 'picture' && type != 'cover') {
      type = 'picture';
    }
    // fetch signedurl for user profile picture and attach to user object
    return $http.get(ENV.apiEndpoint + 'user/' + username + '/' + type + (thumbnail ? '-thumb' : ''));
  }


  function getMe() {
    return new Promise(function(resolve, reject) {
      // Fetch the authenticated user object
      UserAPI.get().$promise.catch(function() {
        // TODO: handle error
        console.error('Unable to fetch user!');
        return reject();
      }).then(function(user) {
        if(!user || !user.data) { return reject(); }

        // Attach the profile picture url to the user object if it exists
        getPictureUrl('me', 'picture', false).then(function(response) {
          if(response && response.data && response.data.data) {
            user.data.profileUrl = response.data.data;
          }
          return getPictureUrl('me', 'picture', true);
        }, function() {
          return getPictureUrl('me', 'picture', true);
        }).then(function(response) {
          if(response && response.data && response.data.data) {
            user.data.profileUrlThumb = response.data.data;
          }
          return getPictureUrl('me', 'cover', false);
        }, function() {
          return getPictureUrl('me', 'cover', false);
        }).then(function(response) {
          if(response && response.data && response.data.data) {
            user.data.coverUrl = response.data.data;
          }
          return getPictureUrl('me', 'cover', true);
        }, function() {
          return getPictureUrl('me', 'cover', true);
        }).then(function(response) {
          if(response && response.data && response.data.data) {
            user.data.coverUrlThumb = response.data.data;
          }
          me.data = user.data;
          resolve();
        }, function() {
          me.data = user.data;
          resolve();
        });
      });
    });
  }
  getMe().then(function() {}, function () {
    console.error("Unable to get user!");
  });

  // Try to fetch self on GET user/me to check auth status
  User.isAuthenticated = function() {
    return new Promise(function(resolve, reject) {
      UserAPI.get().$promise.catch(function() {
        // TODO: handle error
        console.error('Unable to fetch user!');
        return reject();
      }).then(function(user) {
        if(!user || !user.data) { return reject(); }
        return resolve(user.data);
      });
    });
  };

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
        if(!user || !user.data) { return reject(); }

        // Attach the profile picture url to the user object if it exists
        getPictureUrl(username, 'picture', false).then(function(response) {
          if(response && response.data && response.data.data) {
            user.data.profileUrl = response.data.data;
          }
          return getPictureUrl(username, 'picture', true);
        }, function() {
          return getPictureUrl(username, 'picture', true);
        }).then(function(response) {
          if(response && response.data && response.data.data) {
            user.data.profileUrlThumb = response.data.data;
          }
          return getPictureUrl(username, 'cover', false);
        }, function() {
          return getPictureUrl(username, 'cover', false);
        }).then(function(response) {
          if(response && response.data && response.data.data) {
            user.data.coverUrl = response.data.data;
          }
          return getPictureUrl(username, 'cover', true);
        }, function() {
          return getPictureUrl(username, 'cover', true);
        }).then(function(response) {
          if(response && response.data && response.data.data) {
            user.data.coverUrlThumb = response.data.data;
          }
          resolve(user.data);
        }, function() {
          resolve(user.data);
        });
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
