"use strict";

var app = angular.module('wecoApp', ['config', 'ui.router', 'ngAnimate', 'ngSanitize', 'ngFileUpload', 'hc.marked', 'api']);
// configure notification type constants (matches server)
app.constant('NotificationTypes', {
  'NEW_CHILD_BRANCH_REQUEST': 0,
  'CHILD_BRANCH_REQUEST_ANSWERED': 1,
  'BRANCH_MOVED': 2,
  'ADDED_MODERATOR': 3,
  'REMOVED_MODERATOR': 4,
  'NEW_COMMENT': 5,
  'NEW_REPLY': 6
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
      url: '',
      templateUrl: '/app/pages/branch/nucleus/about/about.view.html'
    })
    .state('weco.branch.nucleus.settings', {
      templateUrl: '/app/pages/branch/nucleus/settings/settings.view.html',
      controller: 'nucleusSettingsController'
    })
    .state('weco.branch.nucleus.moderators', {
      templateUrl: '/app/pages/branch/nucleus/moderators/moderators.view.html',
      controller: 'nucleusModeratorsController'
    })
    .state('weco.branch.nucleus.modtools', {
      templateUrl: '/app/pages/branch/nucleus/modtools/modtools.view.html',
      controller: 'nucleusModToolsController'
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

app.run(['$rootScope', '$state', 'User', function($rootScope, $state, User) {
  $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
    var me = User.me();

    // If factory hasn't initialised and me = {}, perform fresh fetch from server
    // to check authentication status. If unauthenticated, user will still be {}
    if(Object.keys(me).length === 0) {
      User.isAuthenticated().then(function(user) {
        me = user;
        doChecks();
      }, doChecks);
    } else {
      doChecks();
    }

    function doChecks() {
      // If state requires authentication and user isn’t authenticated,
      // transition to the specified redirection state
      if(toState.authenticate && Object.keys(me).length === 0) {
        $state.transitionTo(toState.redirectTo);
        event.preventDefault();
      }

      // If state requires authenticated user to be the user specified in the URL,
      // transition to the specified redirection state
      if(toState.selfOnly && (Object.keys(me).length === 0 || toParams.username != me.username)) {
        $state.transitionTo(toState.redirectTo);
        event.preventDefault();
      }
    }
  });
}]);

app.controller('rootController', ['$scope', '$state', function($scope, $state) {
  $scope.hasNavBar = function() {
    if($state.current.name.indexOf('auth') > -1) {
      return false;
    } else {
      return true;
    }
  };
}]);
