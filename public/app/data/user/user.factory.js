'use strict';

var app = angular.module('wecoApp');
app.factory('User', ['UserAPI', 'UserNotificationsAPI', 'FollowedBranchAPI', '$timeout', '$http', 'ENV', 'socket', function(UserAPI, UserNotificationsAPI, FollowedBranchAPI, $timeout, $http, ENV, socket) {
  var User = {};
  var me = {};

  // Get authenticated user object
  User.me = function() {
    return me || {};
  };

  // Get the specified user object, with attached profile picture url
  User.get = function(username) {
    return new Promise(function(resolve, reject) {
      UserAPI.get({ param: username || 'me' }, function(user) {
        if(!user || !user.data) { return reject(); }

        // Attach the profile picture url to the user object if it exists
        User.getPictureUrl(username || 'me', 'picture', false).then(function(response) {
          if(response && response.data && response.data.data) {
            user.data.profileUrl = response.data.data;
          }
          return User.getPictureUrl(username || 'me', 'picture', true);
        }, function() {
          return User.getPictureUrl(username || 'me', 'picture', true);
        }).then(function(response) {
          if(response && response.data && response.data.data) {
            user.data.profileUrlThumb = response.data.data;
          }
          return User.getPictureUrl(username || 'me', 'cover', false);
        }, function() {
          return User.getPictureUrl(username || 'me', 'cover', false);
        }).then(function(response) {
          if(response && response.data && response.data.data) {
            user.data.coverUrl = response.data.data;
          }
          return User.getPictureUrl(username || 'me', 'cover', true);
        }, function() {
          return User.getPictureUrl(username || 'me', 'cover', true);
        }).then(function(response) {
          if(response && response.data && response.data.data) {
            user.data.coverUrlThumb = response.data.data;
          }
          if(!username) {
            me = user.data;
          }
          resolve(user.data);
        }, function() {
          if(!username) {
            me = user.data;
          }
          resolve(user.data);
        });
      }, function(response) {
        if(!username) {
          me = {};
        }
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  // Intial fetch of me object
  User.get().then(function () {},function () {});

  // fetch the presigned url for the profile picture for the specified user,
  // defaulting to authd user if not specified.
  // Returns the promise from $http.
  User.getPictureUrl = function(username, type, thumbnail) {
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
  };

  User.update = function(data) {
    return new Promise(function(resolve, reject) {
      UserAPI.update(data, function() {
        resolve();
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  User.login = function(credentials) {
    return new Promise(function(resolve, reject) {
      UserAPI.login(credentials, function() {
        // reconnect to web sockets to force new 'connection' event,
        // so that the socket id can be obtained and stored on the session object
        // via User.subscribeToNotifications
        socket.disconnect();
        socket.reconnect();
        User.get().then(resolve, reject);
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  User.logout = function() {
    return new Promise(function(resolve, reject) {
      UserAPI.logout({}, function() {
        $timeout(function() {
          socket.disconnect();
          me = {};
          resolve();
        });
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  User.signup = function(credentials) {
    return new Promise(function(resolve, reject) {
      UserAPI.signup(credentials, function() {
        resolve();
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  User.getNotifications = function(username, unreadCount, lastNotificationId) {
    return new Promise(function(resolve, reject) {
      UserNotificationsAPI.get({
        username: username,
        unreadCount: unreadCount,
        lastNotificationId: lastNotificationId
      }, function(response) {
        if(!response || !response.data) {
          if(unreadCount) return resolve(0);
          return reject();
        }
        return resolve(response.data);
      }, function(response) {
        // TODO: handle error
        console.error('Unable to fetch user notifications!');
        return reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  // mark a specified notification as either read or unread
  User.markNotification = function(username, notificationid, unread) {
    return new Promise(function(resolve, reject) {
      UserNotificationsAPI.update({
        username: username,
        notificationid: notificationid
      }, {
        unread: unread
      }, function() {
        resolve();
      }, function(response) {
        // TODO: handle error
        console.error('Unable to mark notification!');
        return reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  // subscribe to real time notifications by storing socketID in db session entry
  User.subscribeToNotifications = function(username, socketID) {
    return new Promise(function(resolve, reject) {
      UserNotificationsAPI.update({
        username: username
      }, {
        socketID: socketID
      }, function() {
        resolve();
      }, function(response) {
        // TODO: handle error
        console.error('Unable to mark notification!');
        return reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  // subscribe to real time notifications by storing socketID in db session entry
  User.unsubscribeFromNotifications = function(username) {
    return new Promise(function(resolve, reject) {
      UserNotificationsAPI.delete({
        username: username
      }, function() {
        resolve();
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  // verify user account
  User.verify = function(username, token) {
    return new Promise(function(resolve, reject) {
      $http.get(ENV.apiEndpoint + 'user/' + username + '/verify/' + token).then(resolve, function(response) {
        reject(response.data);
      });
    });
  };

  // resend the user verification email
  User.resendVerification = function(username) {
    return new Promise(function(resolve, reject) {
      $http.get(ENV.apiEndpoint + 'user/' + username + '/reverify').then(resolve, function(response) {
        reject(response.data);
      });
    });
  };

  // send a reset password link to the users inbox
  User.requestResetPassword = function(username) {
    return new Promise(function(resolve, reject) {
      $http.get(ENV.apiEndpoint + 'user/' + username + '/reset-password').then(resolve, function(response) {
        reject(response.data);
      });
    });
  };

  // send a reset password link to the users inbox
  User.resetPassword = function(username, password, token) {
    return new Promise(function(resolve, reject) {
      $http.post(ENV.apiEndpoint + 'user/' + username + '/reset-password/' + token, { password: password }).then(resolve, function(response) {
        reject(response.data);
      });
    });
  };

  User.getFollowedBranches = function(username) {
    return new Promise(function(resolve, reject) {
      FollowedBranchAPI.get({ username: username }, function(response) {
        console.log("response", response.data);
        resolve(response.data);
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  User.followBranch = function(username, branchid) {
    return new Promise(function(resolve, reject) {
      FollowedBranchAPI.follow({ username: username, branchid: branchid }, function() {
        resolve();
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  User.unfollowBranch = function(username, branchid) {
    return new Promise(function(resolve, reject) {
      FollowedBranchAPI.unfollow({ username: username, branchid: branchid }, function() {
        resolve();
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  return User;
}]);
