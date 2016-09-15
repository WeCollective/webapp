"use strict";

var app = angular.module('wecoApp', ['config', 'ui.router', 'ngAnimate', 'ngSanitize', 'ngFileUpload', 'hc.marked', 'api']);
// configure notification type constants (matches server)
app.constant('NotificationTypes', {
  'NEW_CHILD_BRANCH_REQUEST': 0,
  'CHILD_BRANCH_REQUEST_ANSWERED': 1,
  'BRANCH_MOVED': 2,
  'MODERATOR': 3,
  'COMMENT': 4,
  'POST_FLAGGED': 5,
  'POST_REMOVED': 6
});

// configure the markdown parser for Githib Flavoured Markdown
app.config(['markedProvider', function (markedProvider) {
  markedProvider.setOptions({
    gfm: true,
    sanitize: true
  });
}]);
// configure angular's sanitizer to whitelist youtube URLs to allow embedding
app.config(function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    '*://www.youtube.com/**'
  ]);
});
// custom angular filter for reversing an array
app.filter('reverse', function() {
  return function(items) {
    if (!angular.isArray(items)) return false;
    if (!items) { return false; }
    return items.slice().reverse();
  };
});
// custom angular filter for capitalizing a string
app.filter('capitalize', function() {
  return function(input) {
    return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
  };
});
// configure the router
app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/');

  // remove trailing slashes from URL
  $urlRouterProvider.rule(function($injector, $location) {
    var path = $location.path();
    var hasTrailingSlash = path[path.length-1] === '/';
    if(hasTrailingSlash) {
      //if last charcter is a slash, return the same url without the slash
      var newPath = path.substr(0, path.length - 1);
      return newPath;
    }
  });

  $stateProvider
    // Log In/Sign Up state
    .state('auth', {
      abstract: true,
      templateUrl: '/app/pages/auth/auth.view.html',
      controller: 'authController'
    })
    .state('auth.login', {
      url: '/login'
    })
    .state('auth.signup', {
      url: '/signup'
    })
    .state('verify', {
      url: '/:username/verify/:token',
      templateUrl: '/app/pages/verify/verify.view.html',
      controller: 'verifyController'
    })
    .state('reset-password', {
      url: '/reset-password',
      abstract: true,
      templateUrl: '/app/pages/reset-password/reset-password.view.html',
      controller: 'resetPasswordController'
    })
    .state('reset-password.request', {
      url: '/request',
      templateUrl: '/app/pages/reset-password/request/request.view.html',
      controller: 'requestResetPasswordController'
    })
    .state('reset-password.confirm', {
      url: '/:username/:token',
      templateUrl: '/app/pages/reset-password/confirm/confirm.view.html',
      controller: 'confirmResetPasswordController'
    })
    // Abstract root state contains nav-bar
    .state('weco', {
      abstract: true,
      resolve: {
        authenticate: function() {
          // TODO
          console.log("This code is ran before any state is reached...");
        }
      },
      template: '<nav-bar></nav-bar><div class="full-page" ui-view></div>'
    })
    // 404 Not Found
    .state('weco.notfound', {
      templateUrl: '/app/pages/notfound/notfound.view.html'
    })
    // Homepage state
    .state('weco.home', {
      url: '/',
      templateUrl: '/app/pages/home/home.view.html'
    })
    // Profile page
    .state('weco.profile', {
      url: '/u/:username',
      abstract: true,
      templateUrl: '/app/pages/profile/profile.view.html',
      controller: 'profileController'
    })
    .state('weco.profile.about', {
      url: '/about',
      templateUrl: '/app/pages/profile/about/about.view.html'
    })
    .state('weco.profile.timeline', {
      url: '/timeline',
      templateUrl: '/app/pages/profile/timeline/timeline.view.html'
    })
    .state('weco.profile.settings', {
      url: '/settings',
      templateUrl: '/app/pages/profile/settings/settings.view.html',
      selfOnly: true,
      redirectTo: 'auth.login'
    })
    .state('weco.profile.notifications', {
      url: '/notifications',
      templateUrl: '/app/pages/profile/notifications/notifications.view.html',
      selfOnly: true,
      redirectTo: 'auth.login'
    })
    // Branches
    .state('weco.branch', {
      url: '/b/:branchid',
      abstract: true,
      templateUrl: '/app/pages/branch/branch.view.html',
      controller: 'branchController'
    })
    // Branch Nucleus
    .state('weco.branch.nucleus', {
      url: '/nucleus',
      abstract: true,
      templateUrl: '/app/pages/branch/nucleus/nucleus.view.html',
      controller: 'nucleusController'
    })
    .state('weco.branch.nucleus.about', {
      url: '/about',
      templateUrl: '/app/pages/branch/nucleus/about/about.view.html'
    })
    .state('weco.branch.nucleus.settings', {
      url: '/settings',
      templateUrl: '/app/pages/branch/nucleus/settings/settings.view.html',
      controller: 'nucleusSettingsController',
      modOnly: true,
      redirectTo: 'auth.login'
    })
    .state('weco.branch.nucleus.moderators', {
      url: '/moderators',
      templateUrl: '/app/pages/branch/nucleus/moderators/moderators.view.html',
      controller: 'nucleusModeratorsController'
    })
    .state('weco.branch.nucleus.modtools', {
      url: '/modtools',
      templateUrl: '/app/pages/branch/nucleus/modtools/modtools.view.html',
      controller: 'nucleusModToolsController',
      modOnly: true,
      redirectTo: 'auth.login'
    })
    .state('weco.branch.nucleus.flaggedposts', {
      url: '/flaggedposts',
      templateUrl: '/app/pages/branch/nucleus/flaggedposts/flaggedposts.view.html',
      controller: 'nucleusFlaggedPostsController',
      modOnly: true,
      redirectTo: 'auth.login'
    })
    // Subbranches
    .state('weco.branch.subbranches', {
      url: '/subbranches',
      templateUrl: '/app/pages/branch/subbranches/subbranches.view.html',
      controller: 'subbranchesController'
    })
    // Branch wall
    .state('weco.branch.wall', {
      url: '/wall',
      templateUrl: '/app/pages/branch/wall/wall.view.html',
      controller: 'wallController'
    })
    // Posts
    .state('weco.branch.post', {
      url: '/p/:postid',
      templateUrl: '/app/pages/branch/post/post.view.html',
      controller: 'postController'
    })
    // Comment Permalink
    .state('weco.branch.post.comment', {
      url: '/c/:commentid'
    });

    // default child states
    $urlRouterProvider.when('/u/{username}', '/u/{username}/about');
    $urlRouterProvider.when('/b/{branchid}', '/b/{branchid}/wall');

    // 404 redirect
    $urlRouterProvider.otherwise(function($injector, $location) {
      var state = $injector.get('$state');
      state.go('weco.notfound');
      return $location.path();
    });
});

app.run(['$rootScope', '$state', 'User', 'Mod', 'socket', 'Modal', 'Alerts', function($rootScope, $state, User, Mod, socket, Modal, Alerts) {
  $rootScope.tooltip = {};
  $rootScope.modalOpen = Modal.isOpen;

  socket.on('on_connect', 'notifications', function(data) {
    console.log("Connection established");
    User.get().then(function(me) {
      if(!me.username) { throw 'Not Authenticated'; }
      return User.subscribeToNotifications(me.username, data.id);
    }).then(function() {
      console.log("Successfully subscribed to notifications");
    }).catch(function(err) {
      console.error("Error subscribing to notifications: ", err);
    });
  });

  // unsubscribe from real time notifications using websockets (socket.io)
  socket.on('on_disconnect', 'notifications', function(data) {
    console.log("Disconnected");
    if(User.me().username) {
      User.unsubscribeFromNotifications(User.me().username, data.id).then(function () {
        console.log("Successfully unsubscribed from notifications");
      }, function(err) {
        console.error("Error unsubscribing to notifications: ", err);
      });
    } else {
      console.error("Error unsubscribing to notifications: Not Authenticated");
    }
  });

  // state access controls
  $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
    var mods = [];
    // check if the state we are transitioning to has access restrictions,
    // performing checks if needed
    if(toState.modOnly) {
      getMods(doChecks);
    } else if(toState.selfOnly) {
      doChecks();
    }

    function getMods(cb) {
      Mod.getByBranch(toParams.branchid).then(function(branchMods) {
        mods = branchMods;
        cb();
      }, cb);
    }

    function doChecks() {
      // If state requires authenticated user to be the user specified in the URL,
      // transition to the specified redirection state
      User.get().then(function(me) {
        if(toState.selfOnly && (Object.keys(me).length === 0 || toParams.username != me.username)) {
          console.log(Object.keys(me).length);
          $state.transitionTo(toState.redirectTo);
          event.preventDefault();
        }

        // If state requires authenticated user to be a mod of the branch specified in the URL,
        // transition to the specified redirection state
        if(toState.modOnly) {
          var isMod = false;
          for(var i = 0; i < mods.length; i++) {
            if(mods[i].username == me.username) {
              isMod = true;
            }
          }

          if(!isMod) {
            $state.transitionTo(toState.redirectTo);
            event.preventDefault();
          }
        }
      }, function(err) {
        if(err) {
          console.error("Unable to fetch self: ", err);
          $state.transitionTo(toState.redirectTo);
          event.preventDefault();
        }
      });
    }
  });
}]);

// make socket.io for real-time comms available as a service
app.factory('socket', ['$rootScope', 'ENV', function($rootScope, ENV) {
  // tell jshint that io is a global var
  /* globals io */

  var socket = {};

  // the socket connections to each namespace
  var connections = {};
  // store the actions registered to certain events on certain namespaces
  var actions = [];

  socket.reconnect = function() {
    // notifications and messages refer to their respective socket namespaces
    console.log("Reconnecting");
    // create new socket connections to each namespace
    connections = {
      notifications: io.connect(ENV.apiEndpoint + 'notifications', {'forceNew': true }),
      messages: io.connect(ENV.apiEndpoint + 'messages', {'forceNew': true })
    };

    // bind all registered actions to the new connection instances
    for(var i = 0; i < actions.length; i++) {
      connections[actions[i].namespace].on(actions[i].event, actions[i].cb);
    }
  };

  socket.disconnect = function() {
    console.log("Disconnecting");
    // disconnect all sockets
    for(var namespace in connections) {
      connections[namespace].io.disconnect();
    }
  };

  socket.on = function(event, namespace, cb) {
    // store the action being registered
    actions.push({
      event: event,
      namespace: namespace,
      cb: cb
    });
    // bind the action to the connection instance
    connections[namespace].on(event, cb);
  };

  socket.reconnect();
  return socket;
}]);

app.controller('rootController', ['$scope', '$state', 'ENV', function($scope, $state, ENV) {
  $scope.socketioURL = ENV + 'socket.io/socket.io.js';

  $scope.hasNavBar = function() {
    if($state.current.name.indexOf('auth') > -1 ||
       $state.current.name.indexOf('verify') > -1 ||
       $state.current.name.indexOf('reset-password') > -1) {
      return false;
    } else {
      return true;
    }
  };
}]);
