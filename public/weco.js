"use strict";

var app = angular.module('wecoApp', ['config', 'ui.router', 'ngAnimate', 'ngSanitize', 'ngFileUpload', 'hc.marked', 'angular-google-analytics', 'api']);
// configure notification type constants (matches server)
app.constant('NotificationTypes', {
  'NEW_CHILD_BRANCH_REQUEST': 0,
  'CHILD_BRANCH_REQUEST_ANSWERED': 1,
  'BRANCH_MOVED': 2,
  'MODERATOR': 3,
  'COMMENT': 4,
  'POST_FLAGGED': 5,
  'POST_REMOVED': 6,
  'POST_TYPE_CHANGED': 7,
  'POST_MARKED_NSFW': 8
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
app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'AnalyticsProvider', 'ENV', function($stateProvider, $urlRouterProvider, $locationProvider, AnalyticsProvider, ENV) {
  // configure Google Analytics
  AnalyticsProvider.setAccount('UA-84400255-1');
  if(ENV.name === 'production') {
    AnalyticsProvider.setDomainName('weco.io');
  } else {
    AnalyticsProvider.setDomainName('none');
  }
  // Using ui-router, which fires $stateChangeSuccess instead of $routeChangeSuccess
  AnalyticsProvider.setPageEvent('$stateChangeSuccess');
  AnalyticsProvider.logAllCalls(true);

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
      templateUrl: '/app/pages/home/home.view.html',
      pageTrack: '/'
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
      templateUrl: '/app/pages/profile/about/about.view.html',
      pageTrack: '/u/:username/about'
    })
    .state('weco.profile.timeline', {
      url: '/timeline',
      templateUrl: '/app/pages/profile/timeline/timeline.view.html',
      pageTrack: '/u/:username/timeline'
    })
    .state('weco.profile.settings', {
      url: '/settings',
      templateUrl: '/app/pages/profile/settings/settings.view.html',
      selfOnly: true,
      redirectTo: 'auth.login',
      pageTrack: '/u/:username/settings'
    })
    .state('weco.profile.notifications', {
      url: '/notifications',
      templateUrl: '/app/pages/profile/notifications/notifications.view.html',
      selfOnly: true,
      redirectTo: 'auth.login',
      pageTrack: '/u/:username/notifications'
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
      controller: 'nucleusController',
      pageTrack: '/b/:branchid/nucleus'
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
      url: '/childbranches',
      templateUrl: '/app/pages/branch/subbranches/subbranches.view.html',
      controller: 'subbranchesController',
      pageTrack: '/b/:branchid/childbranches'
    })
    // Branch wall
    .state('weco.branch.wall', {
      url: '/wall',
      templateUrl: '/app/pages/branch/wall/wall.view.html',
      controller: 'wallController',
      pageTrack: '/b/:branchid/wall'
    })
    // Posts
    .state('weco.branch.post', {
      url: '/p/:postid',
      templateUrl: '/app/pages/branch/post/post.view.html',
      controller: 'postController',
      pageTrack: '/p/:postid'
    })
    // Comment Permalink
    .state('weco.branch.post.comment', {
      url: '/c/:commentid',
      pageTrack: '/p/:postid/c/:commentid'
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
}]);

app.run(['$rootScope', '$state', '$timeout', '$window', 'User', 'Mod', 'socket', 'Modal', 'Alerts', 'Analytics', function($rootScope, $state, $timeout, $window, User, Mod, socket, Modal, Alerts, Analytics) {
  // NB: Analytics must be injected at least once to work properly, even if unused.

  $rootScope.tooltip = {};
  $rootScope.modalOpen = Modal.isOpen;

  // Tell Prerender.io to cache when DOM is loaded
  $timeout(function () {
    $window.prerenderReady = true;
  });

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

    // TEMPORARY FOR BETA: ensure logged in before viewing site
    // User.get().then(function() {
    //   carryOn();
    // }, function() {
    //   if(toState.name.indexOf('weco') > -1) {
    //     $state.go('auth.login');
    //   } else {
    //     carryOn();
    //   }
    // });

    // function carryOn() {
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
    // }
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

var app = angular.module('wecoApp');
app.directive('alerts', ['$timeout', 'Alerts', function($timeout, Alerts) {
  return {
    restrict: 'E',
    replace: true,
    scope: {

    },
    templateUrl: '/app/components/alerts/alerts.view.html',
    link: function ($scope) {
      $scope.alerts = Alerts.get;
      $scope.close = Alerts.close;
    }
  };
}]);

var app = angular.module('wecoApp');
app.factory('Alerts', ['$timeout', function($timeout) {
  var Alerts = {};

  var queue = [];
  var duration = 5000;

  function purge() {
    queue = queue.filter(function(alert) {
      return alert.alive === true;
    });
  }

  function close(alert) {
    alert.alive = false;
    $timeout(function() {
      purge();
    }, 600);
  }

  Alerts.get = function () {
    return queue;
  };

  Alerts.push = function(type, text, persist) {
    var alert = {
      type: type,
      text: text,
      alive: true
    };
    $timeout(function() {
      queue = [alert].concat(queue);
      if(!persist) {
        $timeout(function() {
          close(alert);
        }, duration);
      }
    });
  };

  Alerts.close = function(idx) {
    close(queue[idx]);
  };

  return Alerts;
}]);

var app = angular.module('wecoApp');
app.directive('commentThread', ['$state', 'Comment', 'User', '$timeout', 'Alerts', function($state, Comment, User, $timeout, Alerts) {
  return {
    restrict: 'E',
    replace: false,
    scope: {
      comments: '=',
      sortBy: '='
    },
    templateUrl: '/app/components/comment-thread/comment-thread.view.html',
    link: function ($scope) {
      $scope.user = User.me();

      $scope.openComment = undefined; // the comment which is being replied to
      $scope.openReply = function(comment, isEdit) {
        $timeout(function () {
          if($scope.openComment) {
            $scope.openComment.openReply = false;
          }
          $scope.openComment = comment;
          $scope.openComment.openReply = true;
          $scope.openComment.update = isEdit;
        });
      };
      $scope.closeReply = function() {
        $timeout(function() {
          $scope.openComment.openReply = false;
          $scope.openComment = undefined;
        });
      };
      $scope.onCancelComment = function() {
        $scope.closeReply();
      };
      $scope.onSubmitComment = function() {
        if($scope.openComment.update) { // if the comment was edited
          $timeout(function () {
            $scope.openComment.isLoading = true;
          });

          // reload the comment data
          Comment.get($scope.openComment.postid, $scope.openComment.id).then(function(response) {
            $timeout(function() {
              $scope.openComment.data = response;
              $scope.openComment.isLoading = false;
              $scope.closeReply();
            });
          }, function () {
            Alerts.push('error', 'Unable to reload comment!');
            $scope.closeReply();
          });
        } else {  // if the comment was replied to
          // load the replies
          $scope.loadMore($scope.openComment);
          $scope.closeReply();
        }
      };

      // compute a string indicate time since post
      $scope.timeSince = function(date) {
        var msPerMinute = 60 * 1000;
        var msPerHour = msPerMinute * 60;
        var msPerDay = msPerHour * 24;
        var msPerMonth = msPerDay * 30;
        var msPerYear = msPerDay * 365;

        var elapsed = new Date().getTime() - new Date(date);

        if (elapsed < msPerMinute) {
          return Math.round(elapsed/1000) + ' seconds ago';
        }
        if (elapsed < msPerHour) {
          return Math.round(elapsed/msPerMinute) + ' minutes ago';
        }
        if (elapsed < msPerDay ) {
          return Math.round(elapsed/msPerHour ) + ' hours ago';
        }
        if (elapsed < msPerMonth) {
          return Math.round(elapsed/msPerDay) + ' days ago';
        }
        if (elapsed < msPerYear) {
          return Math.round(elapsed/msPerMonth) + ' months ago';
        }
        return Math.round(elapsed/msPerYear ) + ' years ago';
      };

      function getReplies(comment, lastCommentId) {
        // fetch the replies to this comment, or just the number of replies
        Comment.getMany(comment.postid, comment.id, $scope.sortBy.toLowerCase(), lastCommentId).then(function(comments) {
          $timeout(function() {
            // if lastCommentId was specified we are fetching _more_ comments, so append them
            if(lastCommentId) {
              comment.comments = comment.comments.concat(comments);
            } else {
              comment.comments = comments;
            }
          });
        }, function() {
          Alerts.push('error', 'Unable to get replies!');
        });
      }

      $scope.loadMore = function(comment) {
        var lastCommentId = null;
        if(comment.comments && comment.comments.length > 0) lastCommentId = comment.comments[comment.comments.length - 1].id;
        getReplies(comment, lastCommentId);
      };

      $scope.vote = function(comment, direction) {
        Comment.vote(comment.postid, comment.id, direction).then(function() {
          var inc = (direction == 'up') ? 1 : -1;
          $timeout(function() {
            comment.individual += inc;
          });
          Alerts.push('success', 'Thanks for voting!');
        }, function(err) {
          if(err.status === 400) {
            Alerts.push('error', 'You have already voted on this comment.');
          } else {
            Alerts.push('error', 'Error voting on comment.');
          }
        });
      };

      $scope.isOwnComment = function(comment) {
        if(!User.me() || !comment.data) {
          return false;
        }
        return User.me().username == comment.data.creator;
      };

      $scope.openCommentPermalink = function(comment) {
        $state.go('weco.branch.post.comment', { postid: comment.postid, commentid: comment.id }, { reload: true });
      };
    }
  };
}]);

var app = angular.module('wecoApp');
app.directive('dropdown', ['$timeout', function($timeout) {
  return {
    restrict: 'E',
    replace: 'true',
    templateUrl: '/app/components/dropdown/dropdown.view.html',
    scope: {
      title: '&',
      items: '=',
      selected: '='
    },
    link: function($scope, element, attrs) {
      $scope.isOpen = false;

      $scope.open = function() {
        $timeout(function () {
          $scope.isOpen = true;
        });
      };
      $scope.close = function() {
        $timeout(function () {
          $scope.isOpen = false;
        });
      };
      $scope.select = function(idx) {
        $timeout(function () {
          $scope.selected = idx;
          $scope.close();
        });
      };
    }
  };
}]);

/* Component to indicate loading on a DOM element.
** Usage:
**  <div>               - Parent must be position: relative
**    <div loading>     - Root element upon which to superimpose a loading indicator
**      ...             - Element's usual child content
**    </div>
**  </div>
*/

var app = angular.module('wecoApp');
app.directive('loading', ['$compile', function($compile) {
  return {
    restrict: 'A',
    templateUrl: '/app/components/loading/loading.view.html',
    scope: {
      when: '&'
    },
    replace: false,
    transclude: true,
    link: function($scope, element, attrs, ctrl, transclude) {
      /*  Here we perform transclusion manually, instead of using ng-transclude.
      **  This is because ng-transclude automatically assigns the transcluded
      **  content a new *child* scope of the transcluded contents's context.
      **  However, we want the transcluded html to keep the *same* scope of its
      **  context so that its behaviour is unaffected, and changes made within it
      **  are reflected in it's context's scope.
      **
      **  To do this, we make the scope of the transcluded content that of
      **  the parent scope of this directive. (even though the scope
      **  is isolate, its $parent is actually still that of its context,
      **  there just isn't any prototypical inheritance).
      **  The directive's context ($parent) and the context of the transcluded
      **  content are the same, so the transcluded content keeps the scope
      **  of its parent, as desired.
      **
      **  This is implemented through use of the transclude function.
      **  The second param clones the transcluded html and assigns it the scope
      **  supplied in the first parameter. You can then do with it as you want,
      **  and so we append it to the directive template (having removed ng-transclude
      **  from the end of the template also).
      */
      transclude($scope.$parent, function(clone, scope) {
        element.append(clone);
      });
    }
  };
}]);

/* Directive for dynamically generating a template for the display of an entry
** to the mod log.
** Mod log entry data from the server is passed in as 'entry' and rendered HTML
** describing the visualisation of this entry is generated.
**
** The following strings are produced for each entry type:
**
** addmod/remove mod
** <mod1> added/removed <mod2> as a moderator.
**
** make-subbranch-request
** <childmod> made a subbranch request to <parentbranch>.
**
** answer-subbranch-request
** <parentmod> accepted/rejected a subbranch request to <parentbranch> made by <childmod> on <childbranch>.
*/

var app = angular.module('wecoApp');

function getLogActionVerb(action) {
  if(action == 'addmod') {
    return 'added';
  } else if(action == 'removemod') {
    return 'removed';
  } else {
    return '';
  }
}

function getTemplate(entry) {
  var templateStr = '<div class="time">{{ entry.date | date: \'dd MMMM yyyy HH:mm\' }}</div>';

  switch (entry.action) {
    case 'removemod':
    case 'addmod':
      return templateStr +
        '<div class="entry">' +
          '<a ui-sref="weco.profile.about({ username: entry.username })">{{ entry.username }}</a>' +
          ' ' + getLogActionVerb(entry.action) + ' ' +
          '<a ui-sref="weco.profile.about({ username: entry.data })">{{ entry.data }}</a>' +
          ' as a moderator.' +
        '</div>';
    case 'make-subbranch-request':
      return templateStr +
        '<div class="entry">' +
          '<a ui-sref="weco.profile.about({ username: entry.username })">{{ entry.username }}</a>' +
          ' made a Child Branch Request to ' +
          '<a ui-sref="weco.branch.nucleus.about({ branchid: entry.data })">{{ entry.data }}</a>.' +
        '</div>';
    case 'answer-subbranch-request':
      var data = JSON.parse(entry.data);
      return templateStr +
        '<div class="entry">' +
          '<a ui-sref="weco.profile.about({ username: entry.username })">{{ entry.username }}</a> ' +
           data.response + 'ed a Child Branch Request to ' +
          '<a ui-sref="weco.branch.nucleus.about({ branchid: \'' + data.parentid + '\' })">' + data.parentid + '</a>' +
          ' made by ' +
          '<a ui-sref="weco.profile.about({ username: \'' + data.childmod + '\' })">' + data.childmod + '</a>' +
          ' from ' +
          '<a ui-sref="weco.branch.nucleus.about({ branchid: \'' + data.childid + '\' })">' + data.childid + '</a>.' +
        '</div>';
    default:
      return '';
  }
}

app.directive('modLogEntry', ['$compile', function($compile) {

  var linker = function(scope, element, attrs) {
    element.html(getTemplate(scope.entry));
    $compile(element.contents())(scope);
  };

  return {
    restrict: 'A',
    replace: false,
    link: linker,
    scope: {
      entry: '='
    }
  };
}]);

var app = angular.module('wecoApp');
app.controller('modalCreateBranchController', ['$scope', '$timeout', 'Modal', 'Branch', function($scope, $timeout, Modal, Branch) {
  $scope.newBranch = {
    parentid: Modal.getInputArgs().branchid
  };
  $scope.errorMessage = '';

  $scope.$on('OK', function() {
    // if not all fields are filled, display message
    if(!$scope.newBranch || !$scope.newBranch.id || !$scope.newBranch.name) {
      $timeout(function() {
        $scope.errorMessage = 'Please fill in all fields';
      });
      return;
    }

    // perform the update
    $scope.isLoading = true;
    $scope.newBranch.id = $scope.newBranch.id.toLowerCase();
    Branch.create($scope.newBranch).then(function() {
      $timeout(function() {
        var id = $scope.newBranch.id;
        $scope.newBranch = {};
        $scope.errorMessage = '';
        $scope.isLoading = false;
        Modal.OK({
          branchid: id
        });
      });
    }, function(response) {
      $timeout(function() {
        $scope.errorMessage = response.message;
        $scope.isLoading = false;
      });
    });
  });

  $scope.$on('Cancel', function() {
    $timeout(function() {
      $scope.newBranch = {};
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.Cancel();
    });
  });
}]);

var app = angular.module('wecoApp');
app.controller('modalNucleusAddModController', ['$scope', '$timeout', 'Modal', 'Mod', function($scope, $timeout, Modal, Mod) {
  $scope.Modal = Modal;
  $scope.errorMessage = '';
  $scope.isLoading = false;
  $scope.data = {};

  $scope.$on('OK', function() {
    $scope.isLoading = true;
    var branchid = Modal.getInputArgs().branchid;
    Mod.create(branchid, $scope.data.username).then(function() {
      $timeout(function() {
        $scope.data = {};
        $scope.errorMessage = '';
        $scope.isLoading = false;
        Modal.OK();
      });
    }, function(response) {
      $timeout(function() {
        $scope.data = {};
        $scope.errorMessage = response.message;
        if(response.status == 404) {
          $scope.errorMessage = 'That user doesn\'t exist';
        }
        $scope.isLoading = false;
      });
    });
  });

  $scope.$on('Cancel', function() {
    $timeout(function() {
      $scope.data = {};
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.Cancel();
    });
  });
}]);

var app = angular.module('wecoApp');
app.controller('modalNucleusDeleteBranchController', ['$scope', '$timeout', 'Modal', 'Branch', function($scope, $timeout, Modal, Branch) {
  $scope.Modal = Modal;
  $scope.errorMessage = '';
  $scope.isLoading = false;
  $scope.data = {};

  $scope.$on('OK', function() {
    // if not all fields are filled, display message
    if(!$scope.data || !$scope.data.branchid) {
      $timeout(function() {
        $scope.errorMessage = 'Please fill in all fields';
      });
      return;
    }

    $scope.isLoading = true;
    Branch.delete($scope.data.branchid).then(function() {
      $timeout(function() {
        $scope.data = {};
        $scope.errorMessage = '';
        $scope.isLoading = false;
        Modal.OK();
      });
    }, function(response) {
      $timeout(function() {
        $scope.errorMessage = response.message;
        $scope.isLoading = false;
      });
    });
  });

  $scope.$on('Cancel', function() {
    $timeout(function() {
      $scope.data = {};
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.Cancel();
    });
  });
}]);

var app = angular.module('wecoApp');
app.controller('modalNucleusRemoveModController', ['$scope', '$timeout', 'Modal', 'Branch', 'User', 'Mod', function($scope, $timeout, Modal, Branch, User, Mod) {
  $scope.Modal = Modal;
  $scope.errorMessage = '';
  $scope.isLoading = true;

  $scope.mods = [];
  $scope.selectedMod = {};
  function getMod(username, index) {
    var p = User.get(username);
    p.then(function(data) {
      $timeout(function () {
        $scope.mods[index] = data;
      });
    }, function () {
      $scope.errorMessage = 'Unable to get mod!';
    });
    return p;
  }

  // populate mods array with full mod user data based on the usernames
  // given as an argument to the modal
  var promises = [];
  for(var i = 0; i < Modal.getInputArgs().mods.length; i++) {
    promises.push(getMod(Modal.getInputArgs().mods[i].username, i));
  }
  // when all mods fetched, loading finished
  Promise.all(promises).then(function () {
    $scope.isLoading = false;
  });

  $scope.select = function(mod) {
    $scope.selectedMod = mod;
  };

  $scope.$on('OK', function() {
    $scope.isLoading = true;
    var branchid = Modal.getInputArgs().branchid;
    Mod.delete(branchid, $scope.selectedMod.username).then(function() {
      $timeout(function() {
        Modal.OK({
          removedMod: $scope.selectedMod.username
        });
        $scope.selectedMod = {};
        $scope.errorMessage = '';
        $scope.isLoading = false;
      });
    }, function(response) {
      $timeout(function() {
        $scope.errorMessage = response.message;
        if(response.status == 404) {
          $scope.errorMessage = 'That user doesn\'t exist';
        }
        $scope.isLoading = false;
      });
    });
  });

  $scope.$on('Cancel', function() {
    $timeout(function() {
      Modal.Cancel();
      $scope.selectedMod = {};
      $scope.errorMessage = '';
      $scope.isLoading = false;
    });
  });
}]);

var app = angular.module('wecoApp');
app.controller('modalNucleusReviewSubbranchRequestsController', ['$scope', '$timeout', 'Modal', 'Branch', function($scope, $timeout, Modal, Branch) {
  $scope.Modal = Modal;
  $scope.errorMessage = '';
  $scope.requests = [];
  $scope.isLoading = true;

  // Get the list of requests
  Branch.getSubbranchRequests(Modal.getInputArgs().branchid).then(function(requests) {

    // get a specific branch object and insert into requests array on branch attribute
    function getBranch(branchid, index) {
      var p = Branch.get(branchid);
      p.then(function(data) {
        requests[index].branch = data;
      }, function () {
        $scope.errorMessage = 'Unable to get branch!';
      });
      return p;
    }

    // populate requests array with full branch data based on the childids
    var promises = [];
    for(var i = 0; i < requests.length; i++) {
      promises.push(getBranch(requests[i].childid, i));
    }

    // when all branches fetched, loading finished
    Promise.all(promises).then(function () {
      $timeout(function () {
        $scope.requests = requests;
        $scope.isLoading = false;
      });
    }, function() {
      $timeout(function() {
        $scope.errorMessage = 'Unable to fetch child branch requests!';
        $scope.isLoading = false;
      });
    });
  }, function () {
    $scope.errorMessage = 'Unable to fetch child branch requests!';
  });


  $scope.action = function(index, action) {
    $scope.isLoading = true;

    Branch.actionSubbranchRequest(action, $scope.requests[index].parentid,
                                  $scope.requests[index].childid).then(function() {
      $timeout(function() {
        $scope.requests.splice(index, 1);
        $scope.errorMessage = '';
        $scope.isLoading = false;
      });
    }, function(response) {
      $timeout(function() {
        $scope.errorMessage = response.message;
        if(response.status == 404) {
          $scope.errorMessage = 'That user doesn\'t exist';
        }
        $scope.isLoading = false;
      });
    });
  };

  $scope.$on('OK', function() {
    $timeout(function() {
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.OK();
    });
  });

  $scope.$on('Cancel', function() {
    $timeout(function() {
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.Cancel();
    });
  });
}]);

var app = angular.module('wecoApp');
app.controller('modalNucleusSubmitSubbranchRequestController', ['$scope', '$timeout', 'Modal', 'Branch', function($scope, $timeout, Modal, Branch) {
  $scope.Modal = Modal;
  $scope.errorMessage = '';
  $scope.isLoading = false;
  $scope.data = {};

  $scope.$on('OK', function() {
    // if not all fields are filled, display message
    if(!$scope.data || !$scope.data.parentid) {
      $timeout(function() {
        $scope.errorMessage = 'Please fill in all fields';
      });
      return;
    }

    $scope.isLoading = true;
    var branchid = Modal.getInputArgs().branchid;
    Branch.submitSubbranchRequest($scope.data.parentid, branchid).then(function() {
      $timeout(function() {
        $scope.data = {};
        $scope.errorMessage = '';
        $scope.isLoading = false;
        Modal.OK();
      });
    }, function(response) {
      $timeout(function() {
        $scope.errorMessage = response.message;
        $scope.isLoading = false;
      });
    });
  });

  $scope.$on('Cancel', function() {
    $timeout(function() {
      $scope.data = {};
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.Cancel();
    });
  });
}]);

var app = angular.module('wecoApp');
app.controller('modalNucleusUpdateHomepageStatsController', ['$scope', '$timeout', 'Modal', 'Alerts', '$http', 'ENV', function($scope, $timeout, Modal, Alerts, $http, ENV) {
  $scope.Modal = Modal;
  $scope.errorMessage = '';
  $scope.isLoading = true;
  $scope.stats = {
    donation_total: 0,
    raised_total: 0
  };

  // fetch current values
  $http({
    method: 'GET',
    url: ENV.apiEndpoint + 'constant/donation_total'
  }).then(function(result) {
    $scope.stats.donation_total = result.data.data.data;
    return $http({
      method: 'GET',
      url: ENV.apiEndpoint + 'constant/raised_total'
    });
  }).then(function(result) {
    $timeout(function() {
      $scope.stats.raised_total = result.data.data.data;
      $scope.isLoading = false;
    });
  }).catch(function() {
    Alerts.push('error', 'Error updating homepage stats.');
    Modal.Cancel();
  });

  $scope.$on('OK', function() {
    $scope.isLoading = true;
    
    if(isNaN($scope.stats.donation_total) || isNaN($scope.stats.raised_total)) {
      $timeout(function () {
        $scope.errorMessage = 'Invalid amount';
        $scope.isLoading = false;
      });
      return;
    }

    // update donation_total
    $http({
      method: 'PUT',
      url: ENV.apiEndpoint + 'constant/donation_total',
      data: {
        data: Number($scope.stats.donation_total)
      }
    }).then(function() {
      // update donation_total
      return $http({
        method: 'PUT',
        url: ENV.apiEndpoint + 'constant/raised_total',
        data: {
          data: Number($scope.stats.raised_total)
        }
      });
    }).then(function () {
      $timeout(function() {
        $scope.isLoading = false;
        Modal.OK();
      });
    }).catch(function() {
      Alerts.push('error', 'Error updating homepage stats.');
      Modal.Cancel();
    });
  });

  $scope.$on('Cancel', function() {
    $timeout(function() {
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.Cancel();
    });
  });
}]);

var app = angular.module('wecoApp');
app.controller('modalNucleusSettingsController', ['$scope', '$timeout', 'Modal', 'Branch', function($scope, $timeout, Modal, Branch) {
  $scope.Modal = Modal;
  $scope.inputValues = [];
  $scope.textareaValues = [];
  $scope.errorMessage = '';
  $scope.isLoading = false;

  $scope.$on('OK', function() {
    // if not all fields are filled, display message
    if($scope.inputValues.length < Modal.getInputArgs().inputs.length || $scope.inputValues.indexOf('') > -1 ||
       $scope.textareaValues.length < Modal.getInputArgs().textareas.length || $scope.textareaValues.indexOf('') > -1) {
      $timeout(function() {
        $scope.errorMessage = 'Please fill in all fields';
      });
      return;
    }

    // construct data to update using the proper fieldnames
    /* jshint shadow:true */
    var updateData = {};
    for(var i = 0; i < Modal.getInputArgs().inputs.length; i++) {
      updateData[Modal.getInputArgs().inputs[i].fieldname] = $scope.inputValues[i];

      // convert date input values to unix timestamp
      if(Modal.getInputArgs().inputs[i].type == 'date') {
        updateData[Modal.getInputArgs().inputs[i].fieldname] = new Date($scope.inputValues[i]).getTime();
      }
    }
    for(var i = 0; i < Modal.getInputArgs().textareas.length; i++) {
      updateData[Modal.getInputArgs().textareas[i].fieldname] = $scope.textareaValues[i];
    }

    // perform the update
    $scope.isLoading = true;
    Branch.update(updateData).then(function() {
      $timeout(function() {
        $scope.inputValues = [];
        $scope.textareaValues = [];
        $scope.errorMessage = '';
        $scope.isLoading = false;
        Modal.OK();
      });
    }, function(response) {
      $timeout(function() {
        $scope.errorMessage = response.message;
        $scope.isLoading = false;
      });
    });
  });

  $scope.$on('Cancel', function() {
    $timeout(function() {
      $scope.inputValues = [];
      $scope.textareaValues = [];
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.Cancel();
    });
  });
}]);

var app = angular.module('wecoApp');
app.directive('modal', ['Modal', function(Modal) {
  return {
    restrict: 'A',
    replace: false,
    scope: {},
    templateUrl: '/app/components/modals/modal.view.html',
    link: function($scope, elem, attrs) {
      $scope.getTemplateUrl = Modal.templateUrl;
      $scope.isOpen = Modal.isOpen;

      // OK/Cancel broadcasts event down to child scopes,
      // which is the injected modal content controller
      $scope.OK = function() {
        $scope.$broadcast('OK');
      };
      $scope.Cancel = function() {
        $scope.$broadcast('Cancel');
      };
    }
  };
}]);

var app = angular.module('wecoApp');
app.factory('Modal', ['$timeout', function($timeout) {
  var Modal = {};

  var templateUrl = '';
  Modal.templateUrl = function() {
    return templateUrl;
  };

  var isOpen = false;
  Modal.isOpen = function() {
    return isOpen;
  };

  var modalInputArgs = {};
  Modal.getInputArgs = function() {
    return modalInputArgs;
  };
  var modalOutputArgs = {};
  Modal.getOutputArgs = function() {
    return modalOutputArgs;
  };

  var modalResolve;
  var modalReject;
  Modal.open = function(url, args) {
    // force change the template url so that controllers included on
    // the template are reloaded
    templateUrl = "";
    $timeout(function () {
      templateUrl = url;
    });
    isOpen = true;
    modalInputArgs = args;

    return new Promise(function(resolve, reject) {
      modalResolve = resolve;
      modalReject = reject;
    });
  };

  Modal.OK = function(args) {
    $timeout(function() {
      isOpen = false;
      if(args) {
        modalOutputArgs = args;
      }
      modalResolve(true);
    });
  };
  Modal.Cancel = function(args) {
    $timeout(function() {
      isOpen = false;
      if(args) {
        modalOutputArgs = args;
      }
      modalResolve(false);
    });
  };
  Modal.Error = function() {
    modalReject();
  };

  return Modal;
}]);

var app = angular.module('wecoApp');
app.controller('modalCreatePostController', ['$scope', '$timeout', '$http', 'ENV', 'Upload', 'Modal', 'Post', function($scope, $timeout, $http, ENV, Upload, Modal, Post) {
  $scope.Modal = Modal;
  $scope.errorMessage = '';
  $scope.file = null;
  $scope.uploadUrl = '';
  $scope.isUploading = false;
  $scope.isLoading = false;
  $scope.progress = 0;
  $scope.preview = false;
  $scope.newPost = {
    branchids: [Modal.getInputArgs().branchid],
    nsfw: false
  };

  $scope.getProxyUrl = function(url) {
    // only proxy http requests, not https
    if(url && url.substring(0, 5) === 'http:') {
      return ENV.apiEndpoint + 'proxy?url=' + url;
    } else {
      return url;
    }
  };

  $scope.postType = {
    items: ['TEXT', 'PAGE', 'IMAGE', 'VIDEO', 'AUDIO'],
    idx: 0,
    title: 'POST TYPE'
  };

  $scope.togglePreview = function() {
    $scope.preview = !$scope.preview;
  };

  $scope.setFile = function(file) {
    $scope.file = file;
  };

  $scope.upload = function(postid) {
    // get image upload signed url
    $http({
      method: 'GET',
      url: ENV.apiEndpoint + 'post/' + postid + '/picture-upload-url'
    }).then(function(response) {
      if(response && response.data && response.data.data) {
        $scope.uploadUrl = response.data.data;
        // upload the image to s3
        Upload.http({
          url: $scope.uploadUrl,
          method: 'PUT',
          headers: {
            'Content-Type': 'image/*'
          },
          data: $scope.file
        }).then(function(resp) {
          $scope.file = null;
          $scope.isUploading = false;
          $scope.progress = 0;
          Modal.OK();
        }, function(err) {
          $scope.file = null;
          $scope.isUploading = false;
          $scope.progress = 0;
          $scope.errorMessage = 'Unable to upload photo!';
        }, function(evt) {
          $scope.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });
      } else {
        $scope.errorMessage = 'Unable to upload photo!';
      }
    }, function () {
      $scope.errorMessage = 'Unable to upload photo!';
    });
  };

  $scope.$on('OK', function() {
    // if not all fields are filled, display message
    if(!$scope.newPost || !$scope.newPost.title || !$scope.newPost.branchids ||
       $scope.newPost.branchids.length === 0 || !$scope.newPost.text || $scope.newPost.nsfw === undefined) {
      $timeout(function() {
        $scope.errorMessage = 'Please fill in all fields';
      });
      return;
    }

    // perform the update
    $scope.isLoading = true;
    $scope.newPost.type = $scope.postType.items[$scope.postType.idx].toLowerCase();

    // create copy of post to not interfere with binding of items on tag-editor
    var post = JSON.parse(JSON.stringify($scope.newPost)); // JSON parsing faciltates shallow copy
    post.branchids = JSON.stringify($scope.newPost.branchids);
    // save the post to the db
    Post.create(post).then(function(postid) {
      $timeout(function() {
        $scope.errorMessage = '';
        $scope.isLoading = false;
        $scope.progress = 0;
        if($scope.file && $scope.newPost.type != 'image') {
          $scope.isUploading = true;
          $scope.upload(postid);
        } else {
          Modal.OK();
        }
      });
    }, function(response) {
      $timeout(function() {
        $scope.errorMessage = response.message;
        $scope.isLoading = false;
      });
    });
  });

  $scope.$on('Cancel', function() {
    $timeout(function() {
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.Cancel();
    });
  });
}]);

var app = angular.module('wecoApp');
app.controller('modalDeletePostController', ['$scope', '$timeout', 'Modal', 'Post', 'Alerts', function($scope, $timeout, Modal, Post, Alerts) {
  $scope.Modal = Modal;
  $scope.errorMessage = '';
  $scope.isLoading = false;

  $scope.$on('OK', function() {
    $scope.isLoading = true;
    Post.delete(Modal.getInputArgs().postid).then(function() {
      Alerts.push('success', 'Your post was deleted.');
      $scope.isLoading = false;
      Modal.OK();
    }, function(err) {
      $scope.isLoading = false;
      Alerts.push('error', 'Error deleting your post!');
      Modal.Cancel();
    });
  });

  $scope.$on('Cancel', function() {
    $timeout(function() {
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.Cancel();
    });
  });
}]);

var app = angular.module('wecoApp');
app.controller('modalFlagPostController', ['$scope', '$timeout', 'Modal', 'Post', 'Alerts', function($scope, $timeout, Modal, Post, Alerts) {
  $scope.errorMessage = '';
  $scope.isLoading = false;
  $scope.branchid = Modal.getInputArgs().branchid;

  $scope.flagItems = ['AGAINST THE BRANCH RULES', 'AGAINST SITE RULES', 'NOT A ' + Modal.getInputArgs().post.type.toUpperCase() + ' POST'];
  if(!Modal.getInputArgs().post.nsfw) {
    $scope.flagItems.push('NSFW');
  }
  $scope.selectedFlagItemIdx = 0;

  $scope.$on('OK', function() {
    $scope.isLoading = true;
    var post = Modal.getInputArgs().post;
    var type;
    switch($scope.selectedFlagItemIdx) {
      case 0:
        type = 'branch_rules';
        break;
      case 1:
        type = 'site_rules';
        break;
      case 2:
        type = 'wrong_type';
        break;
      case 3:
        type = 'nsfw';
        break;
      default:
        $scope.errorMessage = 'Unknown flag type.';
        $scope.isLoading = false;
        return;
    }

    Post.flag(post.id, $scope.branchid, type).then(function() {
      $timeout(function() {
        $scope.errorMessage = '';
        $scope.isLoading = false;
        Modal.OK();
      });
    }, function(response) {
      $timeout(function() {
        $scope.errorMessage = response.message;
        $scope.isLoading = false;
      });
    });
  });

  $scope.$on('Cancel', function() {
    $timeout(function() {
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.Cancel();
    });
  });

  $scope.close = function() {
    $timeout(function() {
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.Cancel();
    });
  };
}]);

var app = angular.module('wecoApp');
app.controller('modalResolveFlagPostController', ['$scope', '$timeout', 'Modal', 'Post', 'Branch', 'Alerts', function($scope, $timeout, Modal, Post, Branch, Alerts) {
  $scope.errorMessage = '';
  $scope.isLoading = false;
  $scope.post = Modal.getInputArgs().post;
  $scope.text = {
    reason: ''
  };

  $scope.postTypeItems = ['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'PAGE'];
  $scope.selectedPostTypeItemIdx = 0;

  $scope.resolveItems = ['CHANGE POST TYPE', 'REMOVE POST', 'MARK AS NSFW', 'APPROVE POST'];
  $scope.selectedResolveItemIdx = 0;

  $scope.reasonItems = ['VIOLATING BRANCH RULES', 'VIOLATING SITE RULES'];
  $scope.selectedReasonItemIdx = 0;

  $scope.$on('OK', function() {
    $scope.isLoading = true;
    var action;
    var data;
    switch($scope.selectedResolveItemIdx) {
      case 0: // change post type
        action = 'change_type';
        data = $scope.postTypeItems[$scope.selectedPostTypeItemIdx].toLowerCase();
        break;
      case 1: // remove post
        action = 'remove';
        if($scope.selectedReasonItemIdx === 0) {
          data = 'branch_rules';
        } else if($scope.selectedReasonItemIdx === 1) {
          data = 'site_rules';
        } else {
          Alerts.push('error', 'Unknown reason.');
          return;
        }
        break;
      case 2: // mark as nsfw
        action = 'mark_nsfw';
        break;
      case 3: // approve post
        action = 'approve';
        break;
      default:
        Alerts.push('error', 'Unknown action.');
        return;
    }

    if(action === 'remove' && (!$scope.text.reason || $scope.text.reason.length === 0)) {
      $timeout(function() {
        $scope.errorMessage = 'Please provide an explanatory message for the OP';
        $scope.isLoading = false;
      });
      return;
    }

    Branch.resolveFlaggedPost($scope.post.branchid, $scope.post.id, action, data, $scope.text.reason).then(function() {
      $timeout(function() {
        $scope.errorMessage = '';
        $scope.isLoading = false;
        Modal.OK();
      });
    }).catch(function(response) {
      $timeout(function() {
        $scope.errorMessage = response.message;
        $scope.isLoading = false;
      });
    });
  });

  $scope.$on('Cancel', function() {
    $timeout(function() {
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.Cancel();
    });
  });

  $scope.close = function() {
    $timeout(function() {
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.Cancel();
    });
  };
}]);

var app = angular.module('wecoApp');
app.controller('modalProfileSettingsController', ['$scope', '$timeout', 'Modal', 'User', function($scope, $timeout, Modal, User) {
  $scope.Modal = Modal;
  $scope.values = [];
  $scope.errorMessage = '';
  $scope.isLoading = false;

  $scope.$on('OK', function() {
    // if not all fields are filled, display message
    if($scope.values.length < Modal.getInputArgs().inputs.length || $scope.values.indexOf('') > -1) {
      $timeout(function() {
        $scope.errorMessage = 'Please fill in all fields';
      });
      return;
    }

    // construct data to update using the proper fieldnames
    var updateData = {};
    for(var i = 0; i < Modal.getInputArgs().inputs.length; i++) {
      updateData[Modal.getInputArgs().inputs[i].fieldname] = $scope.values[i];

      // convert date input values to unix timestamp
      if(Modal.getInputArgs().inputs[i].type == 'date') {
        updateData[Modal.getInputArgs().inputs[i].fieldname] = new Date($scope.values[i]).getTime();
      }
    }

    // perform the update
    $scope.isLoading = true;
    User.update(updateData).then(function() {
      $timeout(function() {
        $scope.values = [];
        $scope.errorMessage = '';
        $scope.isLoading = false;
        Modal.OK();
      });
    }, function(response) {
      $timeout(function() {
        $scope.errorMessage = response.message;
        $scope.isLoading = false;
      });
    });
  });

  $scope.$on('Cancel', function() {
    $timeout(function() {
      $scope.values = [];
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.Cancel();
    });
  });
}]);

var app = angular.module('wecoApp');
app.controller('modalUploadImageController', ['$scope', '$timeout', 'Modal', '$http', 'ENV', 'Upload', function($scope, $timeout, Modal, $http, ENV, Upload) {
  $scope.Modal = Modal;
  $scope.errorMessage = '';
  $scope.uploadUrl = '';
  $scope.file = null;
  $scope.isUploading = false;
  $scope.progress = 0;

  // when the modal opens, fetch the pre-signed url to use to upload
  // the user's profile picture to S3
  $scope.$watch(function() {
    return Modal.isOpen();
  }, function(isOpen) {
    if(isOpen) {
      $http({
        method: 'GET',
        url: ENV.apiEndpoint + Modal.getInputArgs().route + Modal.getInputArgs().type + '-upload-url'
      }).then(function(response) {
        if(response && response.data && response.data.data) {
          $scope.uploadUrl = response.data.data;
        } else {
          $scope.errorMessage = 'Unable to upload photo!';
        }
      }, function () {
        $scope.errorMessage = 'Unable to upload photo!';
      });
    }
  });

  $scope.setFile = function(file) {
    $scope.file = file;
  };

  $scope.upload = function() {
    if(!$scope.file) {
      $scope.errorMessage = 'No file selected!';
      return;
    }
    Upload.http({
      url: $scope.uploadUrl,
      method: 'PUT',
      headers: {
        'Content-Type': 'image/*'
      },
      data: $scope.file
    }).then(function(resp) {
      $scope.file = null;
      $scope.isUploading = false;
      $scope.progress = 0;
      Modal.OK();
    }, function(err) {
      $scope.file = null;
      $scope.isUploading = false;
      $scope.progress = 0;
      $scope.errorMessage = 'Unable to upload photo!';
    }, function(evt) {
      $scope.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
    });
  };

  $scope.$on('Cancel', function() {
    $timeout(function() {
      $scope.file = null;
      $scope.errorMessage = '';
      Modal.Cancel();
    });
  });

  $scope.$on('OK', function() {
    if(!$scope.file) {
      $scope.errorMessage = 'No file selected!';
      return;
    }
    $timeout(function() {
      $scope.errorMessage = '';
      $scope.isUploading = true;
      $scope.progress = 0;
      $scope.upload();
    });
  });

}]);

var app = angular.module('wecoApp');
app.directive('navBar', ['User', '$state', '$timeout', 'socket', 'Alerts', function(User, $state, $timeout, socket, Alerts) {
  return {
    restrict: 'E',
    replace: 'true',
    templateUrl: '/app/components/nav/nav.view.html',
    link: function($scope, element, attrs) {
      $scope.user = User.me;

      $scope.logout = function() {
        $scope.expanded = false;
        User.logout().then(function() {
          // successful logout; go to login page
          $state.go('auth.login');
        }, function() {
          Alerts.push('error', 'Unable to log out.');
        });
      };

      // return true if the given branch control is selected,
      // i.e. if the current state contains the control name
      $scope.isControlSelected = function(control) {
        return $state.current.name.indexOf(control) > -1 && $state.params.branchid == 'root';
      };

      $scope.onHomePage = function() {
        return $state.current.name == 'weco.home';
      };

      $scope.expanded = false;
      $scope.isNavExpanded = function() {
        return $scope.expanded;
      };

      $scope.toggleNav = function() {
        $scope.expanded = !$scope.expanded;
      };

      $scope.notificationCount = 0;
      function getUnreadNotificationCount() {
        if(!User.me().username) { return; }
        User.getNotifications(User.me().username, true).then(function(count) {
          $timeout(function () {
            $scope.notificationCount = count;
          });
        }, function(err) {
          Alerts.push('error', 'Error fetching notifications.');
        });
      }

      $scope.$watch(function() {
        return User.me().username;
      }, function() {
        getUnreadNotificationCount();
      });

      $scope.$on('$stateChangeSuccess', getUnreadNotificationCount);
      socket.on('notification', 'notifications', getUnreadNotificationCount);

      $scope.showNotificationCount = function() {
        return $scope.notificationCount > 0;
      };

      var animationSrc = '';
      $scope.triggerAnimation = function () {
        // set animation src to the animated gif
        $timeout(function () {
          animationSrc = '/assets/images/logo-animation.gif';
        });
        // cancel after 1 sec
        $timeout(function () {
          animationSrc = '';
        }, 1000);
      };

      $scope.getAnimationSrc = function () {
        return animationSrc;
      };
    }
  };
}]);

var app = angular.module('wecoApp');
app.directive('onScrollToBottom', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var fn = scope.$eval(attrs.onScrollToBottom);
      element.on('scroll', function(e) {
        if(element[0].scrollTop + element[0].offsetHeight >= element[0].scrollHeight) {
          scope.$apply(fn);
        }
      });
    }
  };
});

var app = angular.module('wecoApp');
app.directive("scrollToTopWhen", ['$rootScope', '$timeout', function ($rootScope, $timeout) {
  return {
    link: function($scope, element, attrs) {
      $rootScope.$on(attrs.scrollToTopWhen, function() {
        $timeout(function () {
          angular.element(element)[0].scrollTop = 0;
        });
      });
    }
  };
}]);

var app = angular.module('wecoApp');
app.directive('tabs', ['$state', function($state) {
  return {
    restrict: 'E',
    replace: 'true',
    scope: {
      items: '&',
      states: '&',
      callbacks: '='
    },
    templateUrl: '/app/components/tabs/tabs.view.html',
    link: function($scope, element, attrs) {
      /* NB: states specified in '$scope.states' can be a pure state name, e.g. weco.home,
      **     or they can have parameters, e.g:
      **        weco.branch.subbranches({ "branchid" : "root" })
      **     In the latter case, the parameters must be specified in JSON parsable
      **     format, i.e. with double quotes around property names and values.
      */

      // returns a boolean indicating whether the tab at the given index is selected
      $scope.isSelected = function(index) {
        // for states with parameters, parse the parameters from the state string
        // (i.e. the text within parentheses)
        var openIdx = $scope.states()[index].indexOf('(');
        var closeIdx = $scope.states()[index].indexOf(')');

        // if the specified state has parameters...
        var parsedParams, parsedStateName;
        if(openIdx > -1 && closeIdx > -1) {
          try {
            // parse the parameters from the text between the parentheses
            parsedParams = JSON.parse($scope.states()[index].substr(openIdx + 1, $scope.states()[index].length - openIdx - 2));
            // parse the state name from the text up to the opening parenthesis
            parsedStateName = $scope.states()[index].substr(0, openIdx);
          } catch(err) {
            console.error("Unable to parse JSON!");
          }
        }

        if(parsedParams && parsedStateName) {
          // if the specified state has parameters, the parsed name and state params must match
          return $state.current.name == parsedStateName && JSON.stringify(parsedParams) == JSON.stringify($state.params);
        } else {
          // otherwise, only the state name was given, and it must match the current state
          return $state.current.name == $scope.states()[index];
        }
      };
    }
  };
}]);

var app = angular.module('wecoApp');
app.directive('tagEditor', ['$timeout', function($timeout) {
  return {
    restrict: 'E',
    replace: 'true',
    templateUrl: '/app/components/tag-editor/tag-editor.view.html',
    scope: {
      items: '=',
      title: '&',
      max: '&'
    },
    link: function($scope, element, attrs) {
      $scope.errorMessage = '';
      $scope.data = {};

      $scope.addItem = function() {
        $scope.errorMessage = '';

        // ensure not already at max number of items
        if($scope.items.length >= $scope.max()) {
          return;
        }

        // ensure item exists
        if(!$scope.data.item) {
          return;
        }

        // ensure item doesn't contan whitespace
        if(/\s/g.test($scope.data.item)) {
          $scope.errorMessage = 'Cannot contain spaces.';
          return;
        }

        // convert to all lowercase
        $scope.data.item = $scope.data.item.toLowerCase();

        // ensure not already in list
        if($scope.items.indexOf($scope.data.item) > -1) {
          return;
        }

        // add to list and clear textbox
        $scope.items.push($scope.data.item);
        $scope.data.item = undefined;
      };

      $scope.removeItem = function(item) {
        $scope.errorMessage = '';
        
        if($scope.items.indexOf(item) > -1) {
          $scope.items.splice($scope.items.indexOf(item), 1);
        }
      };
    }
  };
}]);

var app = angular.module('wecoApp');
app.directive('tooltip', ['$rootScope', function($rootScope) {
  return {
    restrict: 'E',
    replace: false,
    scope: {},
    templateUrl: '/app/components/tooltip/tooltip.view.html',
    link: function ($scope, element) {
      $scope.text = function() {
        return $rootScope.tooltip.text;
      };

      $scope.x = function () { return $rootScope.tooltip.x; };
      $scope.y = function () { return $rootScope.tooltip.y; };
      $scope.show = function () { return $rootScope.tooltip.show; };
    }
  };
}]);

app.directive('tooltipText', ['$rootScope', '$window', '$timeout', function($rootScope, $window, $timeout) {
  return {
    restrict: 'A',
    scope: {
      tooltipText: '='
    },
    link: function ($scope, element, attrs) {
      var el = element[0];
      var offsetX = $scope.$eval(attrs.offsetX);
      var offsetY = $scope.$eval(attrs.offsetY);
      if(!offsetX) offsetX = 0;
      if(!offsetY) offsetY = 0;

      el.addEventListener('mouseover', function () {
        $timeout(function () {
          $rootScope.tooltip.show = true;
          $rootScope.tooltip.text = $scope.tooltipText;
          $rootScope.tooltip.x = el.getBoundingClientRect().left + $window.pageXOffset + offsetX;
          $rootScope.tooltip.y = el.getBoundingClientRect().top + $window.pageYOffset + offsetY;
        });
      }, false);

      el.addEventListener('mouseout', function () {
        $timeout(function () {
          $rootScope.tooltip.show = false;
        });
      });
    }
  };
}]);

var app = angular.module('wecoApp');
app.controller('writeCommentController', ['$scope', '$timeout', 'Comment', 'Alerts', function($scope, $timeout, Comment, Alerts) {
  $scope.isLoading = false;
  $scope.comment = {
    text: ''
  };

  $scope.postComment = function() {
    $timeout(function() {
      $scope.isLoading = true;
    });

    $scope.comment.postid = $scope.postid();
    $scope.comment.parentid = $scope.parentid();

    // update an existing comment
    if($scope.update) {
      // NB: if we are editing the existing comment, the supplied "parentid" is
      // actually the id of the comment to be edited
      Comment.update($scope.comment.postid, $scope.comment.parentid, $scope.comment.text).then(function() {
        $timeout(function() {
          $scope.isLoading = false;
          $scope.comment = {
            text: ''
          };
          $scope.onSubmit($scope.comment.id);
        });
      }, function(err) {
        Alerts.push('error', 'Error editing comment.');
        $timeout(function() {
          $scope.isLoading = false;
        });
      });
    } else {
      // create a new comment
      Comment.create($scope.comment).then(function(id) {
        $timeout(function() {
          $scope.isLoading = false;
          $scope.comment = {
            text: ''
          };
          $scope.onSubmit(id);
        });
      }, function(err) {
        Alerts.push('error', 'Error posting comment.');
        $timeout(function() {
          $scope.isLoading = false;
        });
      });
    }
  };

  $scope.cancelComment = function() {
    $timeout(function() {
      $scope.isLoading = false;
      $scope.comment = {
        text: ''
      };
      $scope.onCancel();
    });
  };
}]);

var app = angular.module('wecoApp');
app.directive('writeComment', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      parentid: '&',
      postid: '&',
      onSubmit: '=',
      onCancel: '=',
      update: '=',
      placeholder: '&'
    },
    templateUrl: '/app/components/write-comment/write-comment.view.html',
    controller: 'writeCommentController'
  };
});

"use strict";

 angular.module('config', [])

.constant('ENV', {name:'development',apiEndpoint:'http://api-dev.eu9ntpt33z.eu-west-1.elasticbeanstalk.com/v1/'})

;
var api = angular.module('api', ['ngResource']);
api.config(['$httpProvider', function($httpProvider) {
  // must set withCredentials to keep cookies when making API requests
  $httpProvider.defaults.withCredentials = true;
}]);

var api = angular.module('api');
api.factory('BranchPostsAPI', ['$resource', 'ENV', function($resource, ENV) {

  function makeFormEncoded(data, headersGetter) {
    var str = [];
    for (var d in data)
      str.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    return str.join("&");
  }

  return $resource(ENV.apiEndpoint + 'branch/:branchid/posts/:postid', {
    branchid: '@branchid',
    postid: ''
  }, {
    vote: {
      method: 'PUT',
      // indicate that the data is x-www-form-urlencoded
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      // transform the request to use x-www-form-urlencoded
      transformRequest: makeFormEncoded
    }
  });
}]);

var api = angular.module('api');
api.factory('BranchAPI', ['$resource', 'ENV', function($resource, ENV) {

  function makeFormEncoded(data, headersGetter) {
    var str = [];
    for (var d in data)
      str.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    return str.join("&");
  }

  return $resource(ENV.apiEndpoint + 'branch/:branchid', {},
    {
      update: {
        method: 'PUT',
        // indicate that the data is x-www-form-urlencoded
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        // transform the request to use x-www-form-urlencoded
        transformRequest: makeFormEncoded
      }
    });
}]);

var api = angular.module('api');
api.factory('CommentAPI', ['$resource', 'ENV', function($resource, ENV) {

  function makeFormEncoded(data, headersGetter) {
    var str = [];
    for (var d in data)
      str.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    return str.join("&");
  }

  return $resource(ENV.apiEndpoint + 'post/:postid/comments/:commentid', {
    postid: '@postid',
    commentid: ''
  }, {
    vote: {
      method: 'PUT',
      // indicate that the data is x-www-form-urlencoded
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      // transform the request to use x-www-form-urlencoded
      transformRequest: makeFormEncoded
    },
    update: {
      method: 'PUT',
      // indicate that the data is x-www-form-urlencoded
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      // transform the request to use x-www-form-urlencoded
      transformRequest: makeFormEncoded
    }
  });
}]);

var api = angular.module('api');
api.factory('ModLogAPI', ['$resource', 'ENV', function($resource, ENV) {
  return $resource(ENV.apiEndpoint + 'branch/:branchid/modlog', {}, {});
}]);

var api = angular.module('api');
api.factory('ModsAPI', ['$resource', 'ENV', function($resource, ENV) {
  return $resource(ENV.apiEndpoint + 'branch/:branchid/mods/:username', {}, {});
}]);

var api = angular.module('api');
api.factory('PostAPI', ['$resource', 'ENV', function($resource, ENV) {
  return $resource(ENV.apiEndpoint + 'post/:postid', {}, {});
}]);

var api = angular.module('api');
api.factory('SubbranchRequestAPI', ['$resource', 'ENV', function($resource, ENV) {

  function makeFormEncoded(data, headersGetter) {
    var str = [];
    for (var d in data)
      str.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    return str.join("&");
  }

  return $resource(ENV.apiEndpoint + 'branch/:branchid/requests/subbranches/:childid', {
    branchid: '@branchid',
    childid: '@childid'
  }, {
    getAll: {
      method: 'GET',
      params: {
        childid: ''
      },
      // indicate that the data is x-www-form-urlencoded
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      // transform the request to use x-www-form-urlencoded
      transformRequest: makeFormEncoded
    },
    accept: {
      method: 'PUT',
      // indicate that the data is x-www-form-urlencoded
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      // transform the request to use x-www-form-urlencoded
      transformRequest: makeFormEncoded
    },
    reject: {
      method: 'PUT',
      // indicate that the data is x-www-form-urlencoded
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      // transform the request to use x-www-form-urlencoded
      transformRequest: makeFormEncoded
    }
  });
}]);

var api = angular.module('api');
api.factory('SubbranchesAPI', ['$resource', 'ENV', function($resource, ENV) {
  return $resource(ENV.apiEndpoint + 'branch/:branchid/subbranches', {
    branchid: '@branchid'
  }, {});
}]);

var api = angular.module('api');
api.factory('UserNotificationsAPI', ['$resource', 'ENV', function($resource, ENV) {

  function makeFormEncoded(data, headersGetter) {
    var str = [];
    for (var d in data)
      str.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    return str.join("&");
  }

  return $resource(ENV.apiEndpoint + 'user/:username/notifications/:notificationid', {
    username: '@username',
    notificationid: ''
  }, {
    update: {
      method: 'PUT',
      // indicate that the data is x-www-form-urlencoded
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      // transform the request to use x-www-form-urlencoded
      transformRequest: makeFormEncoded
    }
  });
}]);

var api = angular.module('api');
api.factory('UserAPI', ['$resource', 'ENV', function($resource, ENV) {

  function makeFormEncoded(data, headersGetter) {
    var str = [];
    for (var d in data)
      str.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    return str.join("&");
  }

  return $resource(ENV.apiEndpoint + 'user/:param',
    {
      param: 'me'
    },
    {
      login: {
        method: 'POST',
        params: {
          param: 'login'
        },
        // indicate that the data is x-www-form-urlencoded
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        // transform the request to use x-www-form-urlencoded
        transformRequest: makeFormEncoded
      },
      logout: {
        method: 'GET',
        params: {
          param: 'logout'
        }
      },
      signup: {
        method: 'POST',
        params: {
          param: ''
        }
      },
      update: {
        method: 'PUT',
        // indicate that the data is x-www-form-urlencoded
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        // transform the request to use x-www-form-urlencoded
        transformRequest: makeFormEncoded
      }
    });
}]);

'use strict';

var app = angular.module('wecoApp');
app.factory('Branch', ['BranchAPI', 'SubbranchesAPI', 'ModLogAPI', 'SubbranchRequestAPI', 'BranchPostsAPI', '$http', '$state', 'ENV', function(BranchAPI, SubbranchesAPI, ModLogAPI, SubbranchRequestAPI, BranchPostsAPI, $http, $state, ENV) {
  var Branch = {};
  var me = {};

  // fetch the presigned url for the specified picture for the specified branch
  // Returns the promise from $http.
  Branch.getPictureUrl = function(id, type, thumbnail) {
    // if type not specified, default to profile picture
    if(type != 'picture' && type != 'cover') {
      type = 'picture';
    }
    // fetch signedurl for user profile picture and attach to user object
    return $http({
      method: 'GET',
      url: ENV.apiEndpoint + 'branch/' + id + '/' + type + (thumbnail ? '-thumb' : '')
    });
  };

  Branch.get = function(branchid) {
    return new Promise(function(resolve, reject) {
      BranchAPI.get({ branchid: branchid }, function(branch) {
        if(!branch || !branch.data) { return reject(); }
        // Attach the profile picture and cover urls to the branch object if they exist
        Branch.getPictureUrl(branchid, 'picture', false).then(function(response) {
          if(response && response.data && response.data.data) {
            branch.data.profileUrl = response.data.data;
          }
          return Branch.getPictureUrl(branchid, 'picture', true);
        }, function() {
          return Branch.getPictureUrl(branchid, 'picture', true);
        }).then(function(response) {
          if(response && response.data && response.data.data) {
            branch.data.profileUrlThumb = response.data.data;
          }
          return Branch.getPictureUrl(branchid, 'cover', false);
        }, function() {
          return Branch.getPictureUrl(branchid, 'cover', false);
        }).then(function(response) {
          if(response && response.data && response.data.data) {
            branch.data.coverUrl = response.data.data;
          }
          return Branch.getPictureUrl(branchid, 'cover', true);
        }, function() {
          return Branch.getPictureUrl(branchid, 'cover', true);
        }).then(function(response) {
          if(response && response.data && response.data.data) {
            branch.data.coverUrlThumb = response.data.data;
          }
          resolve(branch.data);
        }, function() {
          resolve(branch.data);
        });
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  Branch.update = function(data) {
    return new Promise(function(resolve, reject) {
      BranchAPI.update({ branchid: $state.params.branchid }, data, function() {
        resolve();
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  Branch.create = function(data) {
    return new Promise(function(resolve, reject) {
      BranchAPI.save(data, function() {
        resolve();
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  Branch.delete = function(branchid) {
    return new Promise(function(resolve, reject) {
      BranchAPI.delete({ branchid: branchid }, function() {
        resolve();
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  // Get the root branches
  Branch.getSubbranches = function(branchid, timeafter, sortBy, lastBranchId) {
    return new Promise(function(resolve, reject) {
      var params = {
        branchid: branchid,
        timeafter: timeafter,
        sortBy: sortBy
      };
      if(lastBranchId) params.lastBranchId = lastBranchId;
      SubbranchesAPI.get(params, function(branches) {
        if(branches && branches.data) {
          resolve(branches.data);
        } else {
          reject({
            status: 500,
            message: 'Something went wrong'
          });
        }
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  // Get a branch's mod log
  Branch.getModLog = function(branchid) {
    return new Promise(function(resolve, reject) {
      ModLogAPI.get({ branchid: branchid }, function(log) {
        if(log && log.data) {
          resolve(log.data);
        } else {
          reject({
            status: 500,
            message: 'Something went wrong'
          });
        }
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  // Submit a SubBranch request
  Branch.submitSubbranchRequest = function(parentid, childid) {
    return new Promise(function(resolve, reject) {
      SubbranchRequestAPI.save({ branchid: parentid, childid: childid }, function() {
        resolve();
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  // Get all the subbranch requests on a given branch
  Branch.getSubbranchRequests = function(parentid) {
    return new Promise(function(resolve, reject) {
      SubbranchRequestAPI.getAll({ branchid: parentid }, function(requests) {
        if(requests && requests.data) {
          resolve(requests.data);
        } else {
          reject({
            status: 500,
            message: 'Something went wrong'
          });
        }
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  // Either 'accept' or 'reject' a subbranch request
  Branch.actionSubbranchRequest = function(action, parentid, childid) {
    return new Promise(function(resolve, reject) {
      function error(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      }

      if(action == 'accept') {
        SubbranchRequestAPI.accept({
          branchid: parentid,
          childid: childid
        }, {
          action: action
        }, resolve, error);
      } else if(action == 'reject') {
        SubbranchRequestAPI.reject({
          branchid: parentid,
          childid: childid
        }, {
          action: action
        }, resolve, error);
      } else {
        return reject({
          status: 400,
          message: 'Invalid action'
        });
      }
    });
  };

  // Get all the posts on a given branch submitted after a given time
  Branch.getPosts = function(branchid, timeafter, sortBy, stat, postType, lastPostId) {
    return new Promise(function(resolve, reject) {
      var params = {
        branchid: branchid,
        timeafter: timeafter,
        sortBy: sortBy,
        stat: stat,
        postType: postType
      };
      if(lastPostId) params.lastPostId = lastPostId;
      BranchPostsAPI.get(params, function(posts) {
        if(posts && posts.data) {
          resolve(posts.data);
        } else {
          reject({
            status: 500,
            message: 'Something went wrong'
          });
        }
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  // Get all the flagged posts on a given branch submitted after a given time
  Branch.getFlaggedPosts = function(branchid, timeafter, sortBy) {
    return new Promise(function(resolve, reject) {
      BranchPostsAPI.get({ branchid: branchid, timeafter: timeafter, sortBy: sortBy, flag: true }, function(posts) {
        if(posts && posts.data) {
          resolve(posts.data);
        } else {
          reject({
            status: 500,
            message: 'Something went wrong'
          });
        }
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  Branch.resolveFlaggedPost = function(branchid, postid, action, data, message) {
    return new Promise(function(resolve, reject) {
      var body = {};
      body.action = action;
      body[(action === 'change_type') ? 'type' : 'reason'] = data;
      body.message = message;
      var url = ENV.apiEndpoint + 'branch/' + branchid + '/posts/' + postid + '/resolve';
      $http.post(url, body).then(resolve, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  return Branch;
}]);

'use strict';

var app = angular.module('wecoApp');
app.factory('Comment', ['CommentAPI', '$http', '$state', 'ENV', function(CommentAPI, $http, $state, ENV) {
  var Comment = {};

  Comment.create = function(data) {
    return new Promise(function(resolve, reject) {
      CommentAPI.save(data, function(response) {
        // pass on the returned commentid
        resolve(response.data);
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  // get the comments on a post or replies to another comment
  Comment.getMany = function(postid, parentid, sortBy, lastCommentId) {
    return new Promise(function(resolve, reject) {
      var params = {
        postid: postid,
        parentid: parentid,
        sort: sortBy
      };
      if(lastCommentId) params.lastCommentId = lastCommentId;
      
      CommentAPI.get(params, function(comments) {
        if(!comments || !comments.data) { return reject(); }
        resolve(comments.data);
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  Comment.get = function(postid, commentid) {
    return new Promise(function(resolve, reject) {
      CommentAPI.get({ postid: postid, commentid: commentid }, function(comment) {
        if(!comment || !comment.data) { return reject(); }
        resolve(comment.data);
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  Comment.vote = function(postid, commentid, vote) {
    return new Promise(function(resolve, reject) {
      if(vote != 'up' && vote != 'down') { return reject(); }

      CommentAPI.vote({
          postid: postid,
          commentid: commentid
        },{
          vote: vote
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

  Comment.update = function(postid, commentid, text) {
    return new Promise(function(resolve, reject) {
      CommentAPI.update({
        postid: postid,
        commentid: commentid
      }, {
        text: text
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

  return Comment;
}]);

'use strict';

var app = angular.module('wecoApp');
app.factory('Mod', ['ModsAPI', '$http', '$state', 'ENV', function(ModsAPI, $http, $state, ENV) {
  var Mod = {};

  Mod.getByBranch = function(branchid) {
    return new Promise(function(resolve, reject) {
      ModsAPI.get({ branchid: branchid }).$promise.catch(function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      }).then(function(mods) {
        if(mods && mods.data) {
          resolve(mods.data);
        } else {
          // successful response contains no branches object:
          // treat as 500 Internal Server Error
          reject({
            status: 500,
            message: 'Something went wrong'
          });
        }
      });
    });
  };

  Mod.create = function(branchid, username) {
    return new Promise(function(resolve, reject) {
      ModsAPI.save({ branchid: branchid }, { username: username })
      .$promise.catch(function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      }).then(function() {
        resolve();
      });
    });
  };

  Mod.delete = function(branchid, username) {
    return new Promise(function(resolve, reject) {
      ModsAPI.delete({ branchid: branchid, username: username })
      .$promise.catch(function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      }).then(function() {
        resolve();
      });
    });
  };

  return Mod;
}]);

'use strict';

var app = angular.module('wecoApp');
app.factory('Post', ['PostAPI', 'BranchPostsAPI', 'CommentAPI', '$http', '$state', 'ENV', function(PostAPI, BranchPostsAPI, CommentAPI, $http, $state, ENV) {
  var Post = {};

  // fetch the presigned url for the specified picture for the specified post
  // Returns the promise from $http.
  Post.getPictureUrl = function(id, thumbnail) {
    // fetch signedurl for user profile picture and attach to user object
    return $http({
      method: 'GET',
      url: ENV.apiEndpoint + 'post/' + id + '/picture' + (thumbnail ? '-thumb' : '')
    });
  };

  Post.create = function(data) {
    return new Promise(function(resolve, reject) {
      PostAPI.save(data, function(response) {
        // pass on the returned postid
        resolve(response.data);
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  Post.get = function(postid) {
    return new Promise(function(resolve, reject) {
      PostAPI.get({ postid: postid }, function(post) {
        if(!post || !post.data) { return reject(); }

        // get the post picture url
        Post.getPictureUrl(postid, false).then(function(response) {
          if(response && response.data && response.data.data) {
            post.data.profileUrl = response.data.data;
          }
          // get the post thumbnail url
          return Post.getPictureUrl(postid, true);
        }).then(function(response) {
          if(response && response.data && response.data.data) {
            post.data.profileUrlThumb = response.data.data;
          }
          resolve(post.data);
        }, function() {
          resolve(post.data);
        });
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  Post.vote = function(branchid, postid, vote) {
    return new Promise(function(resolve, reject) {
      if(vote != 'up' && vote != 'down') { return reject(); }

      BranchPostsAPI.vote({
          branchid: branchid,
          postid: postid
        },{
          vote: vote
        }, resolve, function(response) {
          reject({
            status: response.status,
            message: response.data.message
          });
        });
    });
  };

  Post.delete = function(postid) {
    return new Promise(function(resolve, reject) {
      PostAPI.remove({ postid: postid }, resolve, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  // get the post on a specific branch
  Post.getPostOnBranch = function(postid, branchid) {
    return new Promise(function(resolve, reject) {
      BranchPostsAPI.get({ postid: postid, branchid: branchid }, function(post) {
        if(!post || !post.data) { return reject(); }
        resolve(post.data);
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  Post.flag = function(postid, branchid, flag_type) {
    return new Promise(function(resolve, reject) {
      $http.post(ENV.apiEndpoint + 'post/' + postid + '/flag', {
        flag_type: flag_type,
        branchid: branchid
      }).then(resolve, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  return Post;
}]);

'use strict';

var app = angular.module('wecoApp');
app.factory('User', ['UserAPI', 'UserNotificationsAPI', '$timeout', '$http', 'ENV', 'socket', function(UserAPI, UserNotificationsAPI, $timeout, $http, ENV, socket) {
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

  return User;
}]);

'use strict';

var app = angular.module('wecoApp');
app.controller('authController', ['$scope', '$state', '$timeout', 'User', 'Alerts', function($scope, $state, $timeout, User, Alerts) {
  $scope.credentials = {};
  $scope.user = User.me;
  $scope.isLoading = false;
  $scope.loopAnimation = false;
  $scope.errorMessage = '';
  $scope.showResendVerification = false;

  $scope.isLoginForm = function() {
    return $state.current.name == 'auth.login';
  };

  function login() {
    User.login($scope.credentials).then(function() {
      // successful login; redirect to home page
      $scope.isLoading = false;
      $scope.loopAnimation = false;
      $state.go('weco.home');
    }, function(response) {
      $timeout(function() {
        $scope.errorMessage = response.message;
        $scope.isLoading = false;
        $scope.loopAnimation = false;

        // if forbidden, account is not verified
        if(response.status == 403) {
          $scope.showResendVerification = true;
        }
      });
    });
  }

  function signup() {
    if($scope.credentials.password !== $scope.credentials.confirmPassword) {
      $timeout(function() {
        $scope.errorMessage = 'Inconsistent password!';
        $scope.isLoading = false;
        $scope.loopAnimation = false;
      });
      return;
    }

    User.signup($scope.credentials).then(function() {
      // successful signup; redirect to home page
      $scope.isLoading = false;
      $scope.loopAnimation = false;
      $state.go('weco.home');
      Alerts.push('success', 'Check your inbox to verify your account!', true);
    }, function(response) {
      $timeout(function() {
        $scope.errorMessage = response.message;
        $scope.isLoading = false;
        $scope.loopAnimation = false;
      });
    });
  }

  $scope.submit = function() {
    $scope.isLoading = true;
    $scope.loopAnimation = true;
    $scope.triggerAnimation();
    $scope.credentials.username = $scope.credentials.username.toLowerCase();
    if($scope.isLoginForm()) {
      login();
    } else {
      signup();
    }
  };

  $scope.resendVerification = function() {
    $scope.isLoading = true;
    User.resendVerification($scope.credentials.username).then(function() {
      Alerts.push('success', 'Verification email sent. Keep an eye on your inbox!', true);
      $timeout(function() {
        $scope.errorMessage = '';
        $scope.isLoading = false;
        $scope.showResendVerification = false;
      });
    }, function() {
      Alerts.push('error', 'Unable to resend verification email!', true);
      $timeout(function() {
        $scope.errorMessage = '';
        $scope.isLoading = false;
        $scope.showResendVerification = false;
      });
    });
  };

  var animationSrc = '/assets/images/logo-animation-large.gif';
  $scope.triggerAnimation = function() {
    if(animationSrc !== '') {
      $timeout(function() {
        animationSrc = '';
      });
    }
    // set animation src to the animated gif
    $timeout(function () {
      animationSrc = '/assets/images/logo-animation-large.gif';
    });
    // cancel after 1 sec
    $timeout(function () {
      animationSrc = '';
      if($scope.loopAnimation) $scope.triggerAnimation();
    }, 1000);
  };

  $scope.getAnimationSrc = function () {
    return animationSrc;
  };
}]);

'use strict';

var app = angular.module('wecoApp');
app.controller('branchController', ['$scope', '$rootScope', '$state', '$timeout', 'Branch', 'Mod', 'User', 'Modal', 'Alerts', function($scope, $rootScope, $state, $timeout, Branch, Mod, User, Modal, Alerts) {
  $scope.branchid = $state.params.branchid;
  $scope.showCover = true;
  $scope.isLoading = true;

  $scope.showCoverPicture = function() { $scope.showCover = true; };
  $scope.hideCoverPicture = function() { $scope.showCover = false; };

  // Time filter dropdown configuration
  $scope.timeItems = ['ALL TIME', 'THIS YEAR', 'THIS MONTH', 'THIS WEEK', 'LAST 24 HRS', 'THIS HOUR'];
  $scope.getTimeafter = function(timeItem) {
    // compute the appropriate timeafter for the selected time filter
    var timeafter;
    var date = new Date();
    switch(timeItem) {
      case 'ALL TIME':
        timeafter = 0;
        break;
      case 'THIS YEAR':
        timeafter = new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0).getTime();
        break;
      case 'THIS MONTH':
        timeafter = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0).getTime();
        break;
      case 'THIS WEEK':
        timeafter = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 1, 0, 0, 0, 0).getTime();
        break;
      case 'LAST 24 HRS':
        var yesterday = new Date(date);
        yesterday.setDate(date.getDate() - 1);
        timeafter = new Date(date.getFullYear(), date.getMonth(), yesterday.getDate(), date.getHours(), 0, 0, 0).getTime();
        break;
      case 'THIS HOUR':
        timeafter = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), 0, 0, 0).getTime();
        break;
      default:
    }
    return timeafter;
  };

  // return true if the given branch control is selected,
  // i.e. if the current state contains the control name
  $scope.isControlSelected = function(control) {
    return $state.current.name.indexOf(control) > -1;
  };

  $scope.branch = {};
  $scope.parent = {};
  // fetch branch object
  Branch.get($state.params.branchid).then(function(branch) {
    $timeout(function () {
      $scope.branch = branch;
    });
    // now fetch branch mods
    return Mod.getByBranch($scope.branchid);
  }, function(response) {
    // TODO: handle other error codes
    // branch not found - 404
    if(response.status == 404) {
      $state.go('weco.notfound');
    }
  }).then(function(mods) {
    $timeout(function () {
      $scope.branch.mods = mods;
      $scope.isLoading = false;
    });
    // now fetch branch parent
    return Branch.get($scope.branch.parentid);
  }).then(function(parent) {
    $timeout(function() {
      $scope.parent = parent;
    });
  }, function(response) {
    // No parent exists (in root)
    $timeout(function () {
      $scope.isLoading = false;
    });
  });

  $scope.openProfilePictureModal = function() {
    Modal.open('/app/components/modals/upload/upload-image.modal.view.html', { route: 'branch/' + $scope.branchid + '/', type: 'picture' })
      .then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        Alerts.push('error', 'Unable to update profile picture.');
      });
  };

  $scope.openCoverPictureModal = function() {
    Modal.open('/app/components/modals/upload/upload-image.modal.view.html', { route: 'branch/' + $scope.branchid + '/', type: 'cover' })
      .then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        Alerts.push('error', 'Unable to update cover picture.');
      });
  };

  function createBranch() {
    Modal.open('/app/components/modals/branch/create/create-branch.modal.view.html', {
        branchid: $scope.branchid
      }).then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          if(Modal.getOutputArgs() && Modal.getOutputArgs().branchid) {
            $state.go('weco.branch.subbranches', { branchid: Modal.getOutputArgs().branchid }, { reload: true });
          } else {
            $state.go($state.current, {}, { reload: true });
          }
        }
      }, function() {
        Alerts.push('error', 'Unable to create new branch.');
      });
  }

  function createPost() {
    Modal.open('/app/components/modals/post/create/create-post.modal.view.html', {
        branchid: $scope.branchid
      }).then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          if(Modal.getOutputArgs() && Modal.getOutputArgs().branchid) {
            $state.go('weco.branch.wall', { branchid: Modal.getOutputArgs().branchid }, { reload: true });
          } else {
            $state.go($state.current, {}, { reload: true });
          }
        }
      }, function() {
        Alerts.push('error', 'Unable to create new post.');
      });
  }

  // Called when the add button in the branch controls is clicked.
  // It's behaviour is dependent on the current state.
  $scope.addContent = function () {
    switch ($state.current.name) {
      case 'weco.branch.subbranches':
        createBranch();
        break;
      case 'weco.branch.wall':
        createPost();
        break;
      case 'weco.branch.post':
        // broadcast add comment clicked so that the comment section is scrolled
        // to the top, where the comment box is visible
        $rootScope.$broadcast('add-comment');
        break;
      default:
        console.error("Unable to add content in state " + $state.current.name);
    }
  };

  // dynamic tooltip text for add content button, whose behaviour
  // is dependent on the current state
  $scope.getAddContentTooltip = function() {
    switch ($state.current.name) {
      case 'weco.branch.subbranches':
        return 'Create New Branch';
      case 'weco.branch.wall':
        return 'Add New Post';
      case 'weco.branch.post':
        return 'Write a Comment';
      default:
        return '';
    }
  };

  // returns boolean indicating whether the add content behaviour has any defined
  // behaviour in the current state
  $scope.canAddContent = function() {
    switch ($state.current.name) {
      case 'weco.branch.subbranches':
      case 'weco.branch.wall':
      case 'weco.branch.post':
        return true;
      default:
        return false;
    }
  };

  // returns a boolean indicating whether the current user
  // is a moderator of the current branch
  $scope.isModerator = function () {
    if(!$scope.branch.mods) {
      return false;
    }
    for(var i = 0; i < $scope.branch.mods.length; i++) {
      if($scope.branch.mods[i].username == User.me().username) {
        return true;
      }
    }
    return false;
  };
}]);

var app = angular.module('wecoApp');
app.controller('nucleusFlaggedPostsController', ['$scope', '$state', '$timeout', 'Branch', 'Post', 'Alerts', 'Modal', function($scope, $state, $timeout, Branch, Post, Alerts, Modal) {
  $scope.isLoading = false;
  $scope.isLoadingMore = false;
  $scope.posts = [];

  $scope.postTypeItems = ['ALL', 'TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'PAGE'];
  $scope.selectedPostTypeItemIdx = 0;
  $scope.$watch('selectedPostTypeItemIdx', function () {
    $timeout(function () {
      $scope.isLoading = true;
      $scope.posts = [];
      getPosts();
    });
  });

  $scope.sortByItems = ['DATE', 'BRANCH RULES FLAGS', 'SITE RULES FLAGS', 'WRONG TYPE FLAGS', 'NSFW FLAGS'];
  $scope.selectedSortByItemIdx = 0;
  $scope.$watch('selectedSortByItemIdx', function () {
    $timeout(function () {
      $scope.isLoading = true;
      $scope.posts = [];
      getPosts();
    });
  });

  // Time filter dropdown configuration
  $scope.timeItems = ['ALL TIME', 'THIS YEAR', 'THIS MONTH', 'THIS WEEK', 'LAST 24 HRS', 'THIS HOUR'];
  $scope.selectedTimeItemIdx = 0;
  $scope.$watch('selectedTimeItemIdx', function () {
    $timeout(function () {
      $scope.isLoading = true;
      $scope.posts = [];
      getPosts();
    });
  });

  $scope.getTimeafter = function(timeItem) {
    // compute the appropriate timeafter for the selected time filter
    var timeafter;
    var date = new Date();
    switch(timeItem) {
      case 'ALL TIME':
        timeafter = 0;
        break;
      case 'THIS YEAR':
        timeafter = new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0).getTime();
        break;
      case 'THIS MONTH':
        timeafter = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0).getTime();
        break;
      case 'THIS WEEK':
        timeafter = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 1, 0, 0, 0, 0).getTime();
        break;
      case 'LAST 24 HRS':
        var yesterday = new Date(date);
        yesterday.setDate(date.getDate() - 1);
        timeafter = new Date(date.getFullYear(), date.getMonth(), yesterday.getDate(), date.getHours(), 0, 0, 0).getTime();
        break;
      case 'THIS HOUR':
        timeafter = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), 0, 0, 0).getTime();
        break;
      default:
    }
    return timeafter;
  };

  function getPosts(lastPostId) {
    // compute the appropriate timeafter for the selected time filter
    var timeafter = $scope.getTimeafter($scope.timeItems[$scope.selectedTimeItemIdx]);
    var sortBy;
    switch($scope.sortByItems[$scope.selectedSortByItemIdx]) {
      case 'DATE':
        sortBy = 'date';
        break;
      case 'BRANCH RULES FLAGS':
        sortBy = 'branch_rules';
        break;
      case 'SITE RULES FLAGS':
        sortBy = 'site_rules';
        break;
      case 'WRONG TYPE FLAGS':
        sortBy = 'wrong_type';
        break;
      case 'NSFW FLAGS':
        sortBy = 'nsfw';
        break;
      default:
        sortBy = 'date';
        break;
    }
    var postType = $scope.postTypeItems[$scope.selectedPostTypeItemIdx].toLowerCase();
    // fetch the posts for this branch and timefilter
    Branch.getFlaggedPosts($scope.branchid, timeafter, sortBy, null, postType, lastPostId).then(function(posts) {
      $timeout(function() {
        // if lastPostId was specified we are fetching _more_ posts, so append them
        if(lastPostId) {
          $scope.posts = $scope.posts.concat(posts);
        } else {
          $scope.posts = posts;
        }
        $scope.isLoading = false;
        $scope.isLoadingMore = false;
      });
    }, function() {
      Alerts.push('error', 'Error fetching posts.');
      $scope.isLoading = false;
    });
  }

  $scope.loadMore = function() {
    if(!$scope.isLoadingMore) {
      $scope.isLoadingMore = true;
      if($scope.posts.length > 0) getPosts($scope.posts[$scope.posts.length - 1].id);
    }
  };

  $scope.openResolveFlagPostModal = function(post) {
    Modal.open('/app/components/modals/post/flag/resolve/resolve-flag-post.modal.view.html', { post: post })
      .then(function(result) {
        if(result) {
          Alerts.push('success', 'Done.');
          $timeout(function () {
            $scope.isLoading = true;
            $scope.posts = [];
            getPosts();
          });
        }
      }, function() {
        Alerts.push('error', 'Error resolving flags on post.');
      });
  };

}]);

'use strict';

var app = angular.module('wecoApp');
app.controller('nucleusModeratorsController', ['$scope', '$state', '$timeout', 'User', 'Branch', 'Alerts', function($scope, $state, $timeout, User, Branch, Alerts) {
  $scope.mods = [];
  $scope.isLoading = true;

  $scope.getMod = function(username, index) {
    var p = User.get(username);
    p.then(function(data) {
      $timeout(function() {
        $scope.mods[index] = data;
      });
    }, function () {
      Alerts.push('error', 'Error fetching moderator.');
    });
    return p;
  };

  var promises = [];
  for(var i = 0; i < $scope.branch.mods.length; i++) {
    promises.push($scope.getMod($scope.branch.mods[i].username, i));
  }
  // when all mods fetched, loading finished
  Promise.all(promises).then(function () {
    $scope.isLoading = false;
  }, function() {
    Alerts.push('error', 'Error fetching moderators.');
    $scope.isLoading = false;
  });
}]);

var app = angular.module('wecoApp');
app.controller('nucleusModToolsController', ['$scope', '$state', '$timeout', 'Modal', 'User', 'Branch', 'Alerts', function($scope, $state, $timeout, Modal, User, Branch, Alerts) {
  $scope.isLoading = true;
  $scope.isModLogOpen = false;

  $scope.toggleIsModLogOpen = function () {
    $scope.isModLogOpen = !$scope.isModLogOpen;
  };

  $scope.modLog = [];
  Branch.getModLog($scope.branchid).then(function(log) {
    $timeout(function () {
      $scope.modLog = log;
      $scope.isLoading = false;
    });
  }, function() {
    Alerts.push('error', 'Error fetching moderator action log.');
    $scope.isLoading = false;
  });

  $scope.openAddModModal = function() {
    Modal.open('/app/components/modals/branch/nucleus/modtools/add-mod/add-mod.modal.view.html', { branchid: $scope.branchid })
      .then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        Alerts.push('error', 'Error updating moderator settings.');
      });
  };

  $scope.openRemoveModModal = function() {
    var me;
    /* jshint shadow:true */
    for(var i = 0; i < $scope.branch.mods.length; i++) {
      if($scope.branch.mods[i].username == User.me().username) {
        me = $scope.branch.mods[i];
      }
    }

    // a list of mods to be removed
    // can include self if other mods are present, and
    // removeable others must be added after self
    var removableMods = [];
    for(var i = 0; i < $scope.branch.mods.length; i++) {
      if($scope.branch.mods[i].username === me.username && $scope.branch.mods.length > 1) {
        removableMods.push($scope.branch.mods[i]);
      } else if($scope.branch.mods[i].date > me.date) {
        removableMods.push($scope.branch.mods[i]);
      }
    }

    Modal.open('/app/components/modals/branch/nucleus/modtools/remove-mod/remove-mod.modal.view.html',
      {
        branchid: $scope.branchid,
        mods: removableMods
      }).then(function(result) {
        // if removed self
        if(Modal.getOutputArgs().removedMod == me.username) {
          $state.go('weco.branch.nucleus.about', {}, {reload:true});
        } else if(result) {
          // reload state to force profile reload if OK was pressed
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        Alerts.push('error', 'Error updating moderator settings.');
      });
  };

  $scope.openSubmitSubbranchRequestModal = function() {
    Modal.open('/app/components/modals/branch/nucleus/modtools/submit-subbranch-request/submit-subbranch-request.modal.view.html',
      {
        branchid: $scope.branchid
      }).then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        Alerts.push('error', 'Error submitting child branch request.');
      });
  };

  $scope.openReviewSubbranchRequestsModal = function() {
    Modal.open('/app/components/modals/branch/nucleus/modtools/review-subbranch-requests/review-subbranch-requests.modal.view.html',
      {
        branchid: $scope.branchid
      }).then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        Alerts.push('error', 'Error responding to child branch request.');
      });
  };

  $scope.openDeleteBranchModal = function() {
    Modal.open('/app/components/modals/branch/nucleus/modtools/delete-branch/delete-branch.modal.view.html', {})
      .then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        Alerts.push('error', 'Error deleting branch.');
      });
  };

  $scope.openUpdateHomepageStatsModal = function() {
    Modal.open('/app/components/modals/branch/nucleus/modtools/update-homepage-stats/update-homepage-stats.modal.view.html', {})
      .then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
          Alerts.push('success', 'Successfully updated homepage stats.');
        }
      }, function() {
        Alerts.push('error', 'Error updating homepage stats.');
      });
  };

}]);

'use strict';

var app = angular.module('wecoApp');
app.controller('nucleusController', ['$scope', '$state', '$timeout', 'Branch', 'User', function($scope, $state, $timeout, Branch, User) {
  $scope.tabItems = ['about', 'moderators'];
  $scope.tabStates =
    ['weco.branch.nucleus.about({ "branchid": "' + $scope.branchid + '"})',
     'weco.branch.nucleus.moderators({ "branchid": "' + $scope.branchid + '"})'];

  // If this the auth'd user is a moderator of this branch, add the 'settings' tab
  $scope.$watch($scope.isModerator, function() {
   if($scope.branch.mods) {
     for(var i = 0; i < $scope.branch.mods.length; i++) {
       // is the authd user a mod of this branch?
       if($scope.branch.mods[i].username == User.me().username) {
         // add settings tab
         if($scope.tabItems.indexOf('settings') == -1) {
           $scope.tabItems.push('settings');
           $scope.tabStates.push('weco.branch.nucleus.settings({ "branchid": "' + $scope.branchid + '"})');
         }
         // add mod tools tab
         if($scope.tabItems.indexOf('mod tools') == -1) {
           $scope.tabItems.push('mod tools');
           $scope.tabStates.push('weco.branch.nucleus.modtools({ "branchid": "' + $scope.branchid + '"})');
         }
         // add flagged posts tab
         if($scope.tabItems.indexOf('flagged posts') == -1) {
           $scope.tabItems.push('flagged posts');
           $scope.tabStates.push('weco.branch.nucleus.flaggedposts({ "branchid": "' + $scope.branchid + '"})');
         }
       }
     }
   }
  });

  // modify newlines of \n form to HTML <br> tag form for proper display
  $scope.addHTMLLineBreaks = function(str) {
   if(str) {
     return str.split('\n').join('<br>');
   }
  };
}]);

'use strict';

var app = angular.module('wecoApp');
app.controller('nucleusSettingsController', ['$scope', '$state', '$timeout', 'Modal', 'Alerts', function($scope, $state, $timeout, Modal, Alerts) {

  function openModal(args) {
    Modal.open('/app/components/modals/branch/nucleus/settings/settings.modal.view.html', args)
      .then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        Alerts.push('error', 'Error updating branch settings.');
      });
  }

  $scope.openVisibleNameModal = function() {
    openModal({
      title: 'Visible Name',
      inputs: [
        {
          placeholder: 'Visible name',
          type: 'text',
          fieldname: 'name'
        }
      ],
      textareas: []
    });
  };

  $scope.openRulesModal = function() {
    openModal({
      title: 'Rules & Etiquette',
      inputs: [],
      textareas: [
        {
          placeholder: 'Rules & Etiquette Text',
          fieldname: 'rules'
        }
      ]
    });
  };

  $scope.openDescriptionModal = function() {
    openModal({
      title: 'Description',
      inputs: [],
      textareas: [
        {
          placeholder: 'Description',
          fieldname: 'description'
        }
      ]
    });
  };
}]);

'use strict';

var app = angular.module('wecoApp');
app.controller('postController', ['$scope', '$rootScope', '$state', '$timeout', 'Post', 'Comment', 'Alerts', 'User', 'Modal', 'ENV', function($scope, $rootScope, $state, $timeout, Post, Comment, Alerts, User, Modal, ENV) {
  $scope.isLoadingPost = true;
  $scope.isLoadingComments = true;
  $scope.isLoadingMore = false;
  $scope.post = {};
  $scope.comments = [];
  $scope.markdownRaw = '';
  $scope.videoEmbedURL = '';
  $scope.previewState = 'show'; // other states: 'show', 'maximise'

  $scope.getProxyUrl = function(url) {
    // only proxy http requests, not https
    if(url && url.substring(0, 5) === 'http:') {
      return ENV.apiEndpoint + 'proxy?url=' + url;
    } else {
      return url;
    }
  };

  $scope.getOriginalBranchesTooltipString = function(post) {
    if(!post.data || !post.data.original_branches) return '';
    var tooltip = '';
    var original_branches = JSON.parse(post.data.original_branches);
    for(var i = 1; i < original_branches.length; i++) {
      tooltip += (original_branches[i] + (i < original_branches.length ? '\n' : ''));
    }
    return tooltip;
  };

  $scope.getOriginalBranches = function(post) {
    if(!post.data || !post.data.original_branches) return '';
    return JSON.parse(post.data.original_branches);
  };

  $scope.isOwnPost = function() {
    if(!$scope.post || !$scope.post.data) return false;
    return User.me().username == $scope.post.data.creator;
  };

  $scope.openDeletePostModal = function() {
    Modal.open('/app/components/modals/post/delete/delete-post.modal.view.html', { postid: $scope.post.id })
      .then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go('weco.home');
        }
      }, function() {
        Alerts.push('error', 'Unable to delete post.');
      });
  };

  $scope.sortItems = ['POINTS', 'REPLIES', 'DATE'];

  // watch for change in drop down menu sort by selection
  $scope.selectedSortItemIdx = 0;
  $scope.$watch('selectedSortItemIdx', function () {
    $timeout(function () {
      $scope.isLoadingComments = true;
      $scope.comments = [];
      getComments();
    });
  });

  // when a new comment is posted, reload the comments
  $scope.onSubmitComment = function() {
    $timeout(function () {
      $scope.isLoadingComments = true;
      $scope.comments = [];
      getComments();
    });
  };

  $scope.isCommentPermalink = function() {
    return $state.current.name == 'weco.branch.post.comment';
  };

  $scope.setPreviewState = function(state) {
    $scope.previewState = state;
  };

  // a vote for the post made on the post page is considered the same as a vote
  // made on the world wall, i.e. counts as a vote on the root branch
  $scope.vote = function(post, direction) {
    Post.vote('root', post.id, direction).then(function() {
      var inc = (direction == 'up') ? 1 : -1;
      $timeout(function() {
        post.individual += inc;
        post.local += inc;
        post.global += inc;
      });
      Alerts.push('success', 'Thanks for voting!');
    }, function(err) {
      if(err.status === 400) {
        Alerts.push('error', 'You have already voted on this post.');
      } else {
        Alerts.push('error', 'Error voting on post.');
      }
    });
  };

  function isYouTubeUrl(url) {
    if(url && url !== '') {
      var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
      var match = url.match(regExp);
      if(match && match[2].length == 11) {
        return true;
      }
    }
    return false;
  }

  // ensure the post exists on the specified branch
  Post.getPostOnBranch($state.params.postid, $scope.branchid).then(function() {
    return Post.get($state.params.postid);
  }, function() {
    // post does not exist on this branch
    $state.go('weco.notfound');
  }).then(function(post) {
    $timeout(function () {
      $scope.post = post;
      $scope.markdownRaw = post.data.text;
      $scope.isLoadingPost = false;

      // get the video embed url if this is a video post
      if($scope.post.type == 'video' && isYouTubeUrl($scope.post.data.text)) {
        var video_id = $scope.post.data.text.split('v=')[1] || $scope.post.data.text.split('embed/')[1];
        if(video_id.indexOf('&') != -1) {
          video_id = video_id.substring(0, video_id.indexOf('&'));
        }
        $scope.videoEmbedURL = '//www.youtube.com/embed/' + video_id + '?rel=0';
      }
    });
  }, function(response) {
    // post not found - 404
    if(response.status == 404) {
      $state.go('weco.notfound');
    } else {
      Alerts.push('error', 'Error fetching post.');
    }
    $scope.isLoadingPost = false;
  });

  function getComments(lastCommentId) {
    if($scope.isCommentPermalink()) {
      // fetch the permalinked comment
      Comment.get($state.params.postid, $state.params.commentid).then(function(comment) {
        $timeout(function() {
          $scope.comments = [comment];
          $scope.isLoadingComments = false;
        });
      }, function(err) {
        if(err.status != 404) {
          Alerts.push('error', 'Error loading comments.');
        }
        $scope.isLoadingComments = false;
      });
    } else {
      // fetch all the comments for this post
      var sortBy = $scope.sortItems[$scope.selectedSortItemIdx].toLowerCase();
      Comment.getMany($state.params.postid, undefined, sortBy, lastCommentId).then(function(comments) {
        $timeout(function() {
          // if lastCommentId was specified we are fetching _more_ comments, so append them
          if(lastCommentId) {
            $scope.comments = $scope.comments.concat(comments);
          } else {
            $scope.comments = comments;
          }
          $scope.isLoadingMore = false;
          $scope.isLoadingComments = false;
        });
      }, function(err) {
        if(err.status != 404) {
          Alerts.push('error', 'Error loading comments.');
        }
        $scope.isLoadingComments = false;
      });
    }
  }

  $scope.loadMore = function() {
    if(!$scope.isLoadingMore) {
      $scope.isLoadingMore = true;
      if($scope.comments.length > 0) getComments($scope.comments[$scope.comments.length - 1].id);
    }
  };

  // reload the comments on any state change
  // (when first navigated to AND when going to/from comment permalink state)
  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams, options) {
    $timeout(function () {
      $scope.isLoadingComments = true;
      $scope.comments = [];
      getComments();
    });
  });
}]);

'use strict';

var app = angular.module('wecoApp');
app.controller('subbranchesController', ['$scope', '$state', '$timeout', 'Branch', 'Alerts', function($scope, $state, $timeout, Branch, Alerts) {
  $scope.isLoading = true;
  $scope.isLoadingMore = false;
  $scope.branches = [];

  function getSubbranches(lastBranchId) {
    // compute the appropriate timeafter for the selected time filter
    var timeafter = $scope.getTimeafter($scope.timeItems[$scope.selectedTimeItemIdx]);
    var sortBy;
    switch($scope.sortByItems[$scope.selectedSortByItemIdx]) {
      case 'TOTAL POINTS':
        sortBy = 'post_points';
        break;
      case 'DATE CREATED':
        sortBy = 'date';
        break;
      case '# OF POSTS':
        sortBy = 'post_count';
        break;
      case '# OF COMMENTS':
        sortBy = 'post_comments';
        break;
      default:
        sortBy = 'date';
        break;
    }

    // fetch the subbranches for this branch and timefilter
    Branch.getSubbranches($scope.branchid, timeafter, sortBy, lastBranchId).then(function(branches) {
      $timeout(function() {
        // if lastBranchId was specified we are fetching _more_ branches, so append them
        if(lastBranchId) {
          $scope.branches = $scope.branches.concat(branches);
        } else {
          $scope.branches = branches;
        }
        $scope.isLoading = false;
        $scope.isLoadingMore = false;
      });
    }, function() {
      Alerts.push('error', 'Error fetching branches.');
      $scope.isLoading = false;
    });
  }

  $scope.loadMore = function() {
    if(!$scope.isLoadingMore) {
      $scope.isLoadingMore = true;
      if($scope.branches.length > 0) getSubbranches($scope.branches[$scope.branches.length - 1].id);
    }
  };

  // watch for change in drop down menu time filter selection
  $scope.selectedTimeItemIdx = 0;
  $scope.$watch('selectedTimeItemIdx', function () {
    getSubbranches();
  });

  $scope.sortByItems = ['TOTAL POINTS', '# OF POSTS', '# OF COMMENTS', 'DATE CREATED'];
  $scope.selectedSortByItemIdx = 0;
  $scope.$watch('selectedSortByItemIdx', function () {
    getSubbranches();
  });

}]);

'use strict';

var app = angular.module('wecoApp');
app.controller('wallController', ['$scope', '$state', '$timeout', 'Branch', 'Post', 'Alerts', 'Modal', 'ENV', function($scope, $state, $timeout, Branch, Post, Alerts, Modal, ENV) {
  $scope.isLoading = false;
  $scope.isLoadingMore = false;
  $scope.posts = [];
  $scope.stat = 'global';

  $scope.getProxyUrl = function(url) {
    // only proxy http requests, not https
    if(url && url.substring(0, 5) === 'http:') {
      return ENV.apiEndpoint + 'proxy?url=' + url;
    } else {
      return url;
    }
  };

  $scope.getOriginalBranchesTooltipString = function(post) {
    if(!post.data || !post.data.original_branches) return '';
    var tooltip = '';
    var original_branches = JSON.parse(post.data.original_branches);
    for(var i = 1; i < original_branches.length; i++) {
      tooltip += (original_branches[i] + (i < original_branches.length ? '\n' : ''));
    }
    return tooltip;
  };

  $scope.getOriginalBranches = function(post) {
    if(!post.data || !post.data.original_branches) return '';
    return JSON.parse(post.data.original_branches);
  };

  $scope.vote = function(post, direction) {
    Post.vote($scope.branchid, post.id, direction).then(function() {
      var inc = (direction == 'up') ? 1 : -1;
      $timeout(function() {
        post.individual += inc;
        post.local += inc;
        post.global += inc;
      });
      Alerts.push('success', 'Thanks for voting!');
    }, function(err) {
      if(err.status === 400) {
        Alerts.push('error', 'You have already voted on this post.');
      } else {
        Alerts.push('error', 'Error voting on post.');
      }
    });
  };

  $scope.setStat = function(stat) {
    $timeout(function () {
      $scope.isLoading = true;
      $scope.stat = stat;
      $scope.posts = [];
      getPosts();
    });
  };

  // return the correct ui-sref string for when the specified post is clicked
  $scope.getLink = function(post) {
    if(post.type == 'text') {
      return $state.href('weco.branch.post', { postid: post.id });
    }
    return post.text;
  };

  function getPosts(lastPostId) {
    // compute the appropriate timeafter for the selected time filter
    var timeafter = $scope.getTimeafter($scope.timeItems[$scope.selectedTimeItemIdx]);
    var sortBy;
    switch($scope.sortByItems[$scope.selectedSortByItemIdx]) {
      case 'TOTAL POINTS':
        sortBy = 'points';
        break;
      case 'DATE':
        sortBy = 'date';
        break;
      case 'NUMBER OF COMMENTS':
        sortBy = 'comment_count';
        break;
      default:
        sortBy = 'points';
        break;
    }
    var postType;
    switch($scope.postTypeItems[$scope.selectedPostTypeItemIdx]) {
      case 'IMAGES':
        postType = 'image';
        break;
      case 'VIDEOS':
        postType = 'video';
        break;
      case 'PAGES':
        postType = 'page';
        break;
      default:
        postType = $scope.postTypeItems[$scope.selectedPostTypeItemIdx].toLowerCase();
        break;
    }

    // fetch the posts for this branch and timefilter
    Branch.getPosts($scope.branchid, timeafter, sortBy, $scope.stat, postType, lastPostId).then(function(posts) {
      $timeout(function() {
        // if lastPostId was specified we are fetching _more_ posts, so append them
        if(lastPostId) {
          $scope.posts = $scope.posts.concat(posts);
        } else {
          $scope.posts = posts;
        }
        $scope.isLoading = false;
        $scope.isLoadingMore = false;
      });
    }, function() {
      Alerts.push('error', 'Error fetching posts.');
      $scope.isLoading = false;
    });
  }

  $scope.loadMore = function() {
    if(!$scope.isLoadingMore) {
      $scope.isLoadingMore = true;
      if($scope.posts.length > 0) getPosts($scope.posts[$scope.posts.length - 1].id);
    }
  };

  $scope.openFlagPostModal = function(post) {
    Modal.open('/app/components/modals/post/flag/flag-post.modal.view.html', { post: post, branchid: $scope.branchid })
      .then(function(result) {
        if(result) {
          Alerts.push('success', 'Post flagged. The branch moderators will be informed.');
        }
      }, function() {
        Alerts.push('error', 'Unable to flag post.');
      });
  };

  // watch for change in drop down menu time filter selection
  $scope.selectedTimeItemIdx = 0;
  $scope.$watch('selectedTimeItemIdx', function () {
    $timeout(function () {
      $scope.isLoading = true;
      $scope.posts = [];
      getPosts();
    });
  });

  $scope.postTypeItems = ['ALL', 'TEXT', 'IMAGES', 'VIDEOS', 'AUDIO', 'PAGES'];
  $scope.selectedPostTypeItemIdx = 0;

  $scope.$watch('selectedPostTypeItemIdx', function () {
    $timeout(function () {
      $scope.isLoading = true;
      $scope.posts = [];
      getPosts();
    });
  });

  $scope.sortByItems = ['TOTAL POINTS', 'NUMBER OF COMMENTS', 'DATE'];
  $scope.selectedSortByItemIdx = 0;

  $scope.$watch('selectedSortByItemIdx', function () {
    $timeout(function () {
      $scope.isLoading = true;
      $scope.posts = [];
      getPosts();
    });
  });
}]);

var app = angular.module('wecoApp');
app.controller('homeController', ['$scope', '$http', 'ENV', '$timeout', function($scope, $http, ENV, $timeout) {
  $scope.stats = {
    donation_total: '...',
    raised_total: '...',
    user_count: '...',
    branch_count: '...'
  };

  // fetch current values
  $http({
    method: 'GET',
    url: ENV.apiEndpoint + 'constant/donation_total'
  }).then(function(result) {
    $scope.stats.donation_total = result.data.data.data;
    return $http({
      method: 'GET',
      url: ENV.apiEndpoint + 'constant/raised_total'
    });
  }).then(function(result) {
    $scope.stats.raised_total = result.data.data.data;
    return $http({
      method: 'GET',
      url: ENV.apiEndpoint + 'constant/user_count'
    });
  }).then(function(result) {
    $scope.stats.user_count = result.data.data.data;
    return $http({
      method: 'GET',
      url: ENV.apiEndpoint + 'constant/branch_count'
    });
  }).then(function(result) {
    $timeout(function() {
      $scope.stats.branch_count = result.data.data.data;
    });
  }).catch(function() {
    console.error("Error fetching homepage stats.");
  });
}]);

var app = angular.module('wecoApp');
app.controller('profileNotificationsController', ['$scope', '$state', '$timeout', 'User', 'NotificationTypes', 'Alerts', function($scope, $state, $timeout, User, NotificationTypes, Alerts) {
  $scope.isLoading = false;
  $scope.isLoadingMore = false;
  $scope.NotificationTypes = NotificationTypes;
  $scope.me = User.me;
  $scope.notifications = [];

  $scope.getNotificationImageType = function(notification) {
    switch(notification.type) {
      case NotificationTypes.NEW_CHILD_BRANCH_REQUEST:
      case NotificationTypes.CHILD_BRANCH_REQUEST_ANSWERED:
      case NotificationTypes.BRANCH_MOVED:
        return 'branch';
      case NotificationTypes.MODERATOR:
        return 'moderator';
      case NotificationTypes.COMMENT:
        return 'comment';
      case NotificationTypes.POST_FLAGGED:
      case NotificationTypes.POST_REMOVED:
      case NotificationTypes.POST_TYPE_CHANGED:
        return 'flagged';
      default:
        return 'user';
    }
  };

  function getNotifications(lastNotificationId) {
    $scope.isLoading = true;

    User.getNotifications($state.params.username, false, lastNotificationId).then(function(notifications) {
      $timeout(function() {
        if(lastNotificationId) {
          $scope.notifications = $scope.notifications.concat(notifications);
        } else {
          $scope.notifications = notifications;
        }
        $scope.isLoading = false;
        $scope.isLoadingMore = false;
      });
    }, function() {
      Alerts.push('error', 'Unable to fetch notifications.');
    });
  }

  $scope.setUnread = function(notification, unread) {
    User.markNotification(User.me().username, notification.id, unread).then(function() {
      $timeout(function() {
        notification.unread = unread;
      });
    }, function(err) {
      Alerts.push('error', 'Unable to mark notification.');
    });
  };

  $scope.loadMore = function() {
    if(!$scope.isLoadingMore) {
      $scope.isLoadingMore = true;
      if($scope.notifications.length > 0) getNotifications($scope.notifications[$scope.notifications.length - 1].id);
    }
  };

  // initial fetch of notifications
  getNotifications();

  $scope.reasonString = function(reason) {
    switch(reason) {
      case 'branch_rules':
        return 'for violating the branch rules';
      case 'site_rules':
        return 'for violating the site rules';
      case 'wrong_type':
        return 'for being tagged with an incorrect post type';
      case 'nsfw':
        return 'as NSFW';
      default:
        return '';
    }
  };
}]);

'use strict';

var app = angular.module('wecoApp');
app.controller('profileController', ['$scope', '$timeout', '$state', 'User', 'Modal', 'Alerts', function($scope, $timeout, $state, User, Modal, Alerts) {
  $scope.user = {};
  $scope.showCover = true;
  $scope.isLoading = true;

  $scope.showCoverPicture = function() { $scope.showCover = true; };
  $scope.hideCoverPicture = function() { $scope.showCover = false; };

  User.get($state.params.username).then(function(user) {
    $timeout(function() {
      $scope.user = user;
      $scope.isLoading = false;
    });
  }, function(response) {
    if(response.status == 404) {
      $state.go('weco.notfound');
    } else {
      Alerts.push('error', 'Unable to fetch user.');
    }
    $scope.isLoading = false;
  });

  $scope.tabItems = ['about', 'timeline'];
  $scope.tabStates = ['weco.profile.about', 'weco.profile.timeline'];

  // Watch for changes in the auth'd user's username
  // When set, if this is the auth'd user's profile page, add the 'settings' tab
  $scope.$watch(function() {
    return User.me().username;
  }, function(username) {
    if(username == $state.params.username) {
      if($scope.tabItems.indexOf('settings') == -1 && $scope.tabStates.indexOf('weco.profile.settings') == -1) {
        $scope.tabItems.push('settings');
        $scope.tabStates.push('weco.profile.settings');
      }
      if($scope.tabItems.indexOf('notifications') == -1 && $scope.tabStates.indexOf('weco.profile.notifications') == -1) {
        $scope.tabItems.push('notifications');
        $scope.tabStates.push('weco.profile.notifications');
      }
    }
  });

  $scope.openProfilePictureModal = function() {
    Modal.open('/app/components/modals/upload/upload-image.modal.view.html', { route: 'user/me/', type: 'picture' })
      .then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        Alerts.push('error', 'Unable to change profile picture.');
      });
  };

  $scope.openCoverPictureModal = function() {
    Modal.open('/app/components/modals/upload/upload-image.modal.view.html', { route: 'user/me/', type: 'cover' })
      .then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        Alerts.push('error', 'Unable to change cover picture.');
      });
  };

  $scope.isMyProfile = function() {
    return User.me().username == $state.params.username;
  };
}]);

var app = angular.module('wecoApp');
app.controller('profileSettingsController', ['$scope', '$state', 'Modal', 'Alerts', 'User', function($scope, $state, Modal, Alerts, User) {
  function openModal(args) {
    Modal.open('/app/components/modals/profile/settings/settings.modal.view.html', args)
      .then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
          Alerts.push('success', 'Successfully updated profile settings!');
        }
      }, function() {
        Alerts.push('error', 'Unable to update profile settings.');
      });
  }

  $scope.openNameModal = function() {
    openModal({
      title: 'Name',
      inputs: [{
          placeholder: 'First name',
          type: 'text',
          fieldname: 'firstname'
        }, {
          placeholder: 'Last name',
          type: 'text',
          fieldname: 'lastname'
        }
      ]
    });
  };

  $scope.openEmailModal = function() {
    openModal({
      title: 'Email',
      inputs: [{
        placeholder: 'Email',
        type: 'email',
        fieldname: 'email'
      }]
    });
  };

  $scope.openDOBModal = function() {
    openModal({
      title: 'Date of Birth',
      inputs: [{
        placeholder: 'Date of Birth',
        type: 'date',
        fieldname: 'dob'
      }]
    });
  };

  $scope.updateNSFW = function() {
    User.update({
      show_nsfw: $scope.user.show_nsfw
    }).then(function() {
      Alerts.push('success', 'Successfully updated profile settings!');
    }, function() {
      Alerts.push('error', 'Unable to update profile settings.');
    });
  };
}]);

var app = angular.module('wecoApp');
app.controller('confirmResetPasswordController', ['$scope', '$state', '$timeout', 'User', 'Alerts', function($scope, $state, $timeout, User, Alerts) {
  $scope.resetPassword = function() {
    $scope.setLoading(true);
    $scope.setLoopAnimation(true);
    $scope.triggerAnimation();

    if($scope.credentials.password != $scope.credentials.confirmPassword) {
      Alerts.push('error', 'The two passwords are different.');
      $scope.setLoading(false);
      $scope.setLoopAnimation(false);
      return;
    }
    User.resetPassword($state.params.username, $scope.credentials.password, $state.params.token).then(function() {
      Alerts.push('success', 'Successfully updated password! You can now login.', true);
      $scope.setLoading(false);
      $scope.setLoopAnimation(false);
      $state.go('auth.login');
    }, function(response) {
      $timeout(function () {
        $scope.setErrorMessage(response.message);
        $scope.setLoading(false);
        $scope.setLoopAnimation(false);
      });
    });
  };
}]);

var app = angular.module('wecoApp');
app.controller('requestResetPasswordController', ['$scope', '$state', '$timeout', 'User', 'Alerts', function($scope, $state, $timeout, User, Alerts) {
  $scope.sendLink = function() {
    $scope.setLoading(true);
    $scope.setLoopAnimation(true);
    $scope.triggerAnimation();

    User.requestResetPassword($scope.credentials.username).then(function() {
      $state.go('weco.home');
      $scope.setLoading(false);
      $scope.setLoopAnimation(false);
      Alerts.push('success', 'A password reset link has been sent to your inbox.', true);
    }, function(response) {
      $scope.setLoading(false);
      $scope.setErrorMessage(response.message);
      $scope.setLoopAnimation(false);
    });
  };
}]);

var app = angular.module('wecoApp');
app.controller('resetPasswordController', ['$scope', '$state', '$timeout', 'User', 'Alerts', function($scope, $state, $timeout, User, Alerts) {
  $scope.errorMessage = '';
  $scope.isLoading = false;
  $scope.loopAnimation = false;
  $scope.credentials = {};

  var animationSrc = '/assets/images/logo-animation-large.gif';
  $scope.triggerAnimation = function() {
    if(animationSrc !== '') {
      $timeout(function() {
        animationSrc = '';
      });
    }
    // set animation src to the animated gif
    $timeout(function () {
      animationSrc = '/assets/images/logo-animation-large.gif';
    });
    // cancel after 1 sec
    $timeout(function () {
      animationSrc = '';
      if($scope.loopAnimation) $scope.triggerAnimation();
    }, 1000);
  };

  $scope.setLoopAnimation = function(loop) { $scope.loopAnimation = loop; };
  $scope.setErrorMessage = function(message) { $scope.errorMessage = message; };
  $scope.setLoading = function(loading) { $scope.isLoading = loading; };

  $scope.getAnimationSrc = function () {
    return animationSrc;
  };
}]);

var app = angular.module('wecoApp');
app.controller('verifyController', ['$scope', '$state', '$interval', '$timeout', 'User', 'Alerts', function($scope, $state, $interval, $timeout, User, Alerts) {
  $scope.message = 'Verifying your account.';
  var animationSrc = '/assets/images/logo-animation-large.gif';

  $interval(function () {
    if(animationSrc !== '') {
      $timeout(function() {
        animationSrc = '';
      });
    }
    // set animation src to the animated gif
    $timeout(function () {
      animationSrc = '/assets/images/logo-animation-large.gif';
    });

    if($scope.message.indexOf('...') > -1) {
      $scope.message = 'Verifying your account.';
    } else {
      $scope.message += '.';
    }
  }, 1000);

  $timeout(function () {
    User.verify($state.params.username, $state.params.token).then(function() {
      $state.go('auth.login');
      Alerts.push('success', 'Account verified! You can now login.', true);
    }, function(err) {
      Alerts.push('error', 'Unable to verify your account. Your token may have expired: try signing up again.', true);
      $state.go('auth.signup');
    });
  }, 3000);

  $scope.getAnimationSrc = function () {
    return animationSrc;
  };
}]);

/**
 * Angular Google Analytics - Easy tracking for your AngularJS application
 * @version v1.1.7 - 2016-03-25
 * @link http://github.com/revolunet/angular-google-analytics
 * @author Julien Bouquillon <julien@revolunet.com> (https://github.com/revolunet)
 * @contributors Julien Bouquillon (https://github.com/revolunet),Justin Saunders (https://github.com/justinsa),Chris Esplin (https://github.com/deltaepsilon),Adam Misiorny (https://github.com/adam187)
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
/* globals define */
(function (root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define(['angular'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('angular'));
  } else {
    factory(root.angular);
  }
}(this, function (angular, undefined) {
  'use strict';
  angular.module('angular-google-analytics', [])
    .provider('Analytics', function () {
      var accounts,
          analyticsJS = true,
          cookieConfig = 'auto', // DEPRECATED
          created = false,
          crossDomainLinker = false,
          crossLinkDomains,
          currency = 'USD',
          debugMode = false,
          delayScriptTag = false,
          displayFeatures = false,
          disableAnalytics = false,
          domainName,
          ecommerce = false,
          enhancedEcommerce = false,
          enhancedLinkAttribution = false,
          experimentId,
          ignoreFirstPageLoad = false,
          logAllCalls = false,
          hybridMobileSupport = false,
          offlineMode = false,
          pageEvent = '$routeChangeSuccess',
          readFromRoute = false,
          removeRegExp,
          testMode = false,
          traceDebuggingMode = false,
          trackPrefix = '',
          trackRoutes = true,
          trackUrlParams = false;

      this.log = [];
      this.offlineQueue = [];

      /**
       * Configuration Methods
       **/

      this.setAccount = function (tracker) {
        if (angular.isUndefined(tracker) || tracker === false) {
          accounts = undefined;
        } else if (angular.isArray(tracker)) {
          accounts = tracker;
        } else if (angular.isObject(tracker)) {
          accounts = [tracker];
        } else {
          // In order to preserve an existing behavior with how the _trackEvent function works,
          // the trackEvent property must be set to true when there is only a single tracker.
          accounts = [{ tracker: tracker, trackEvent: true }];
        }
        return this;
      };

      this.trackPages = function (val) {
        trackRoutes = !!val;
        return this;
      };

      this.trackPrefix = function (prefix) {
        trackPrefix = prefix;
        return this;
      };

      this.setDomainName = function (domain) {
        domainName = domain;
        return this;
      };

      this.useDisplayFeatures = function (val) {
        displayFeatures = !!val;
        return this;
      };

      this.useAnalytics = function (val) {
        analyticsJS = !!val;
        return this;
      };

      this.useEnhancedLinkAttribution = function (val) {
        enhancedLinkAttribution = !!val;
        return this;
      };

      this.useCrossDomainLinker = function (val) {
        crossDomainLinker = !!val;
        return this;
      };

      this.setCrossLinkDomains = function (domains) {
        crossLinkDomains = domains;
        return this;
      };

      this.setPageEvent = function (name) {
        pageEvent = name;
        return this;
      };

      /* DEPRECATED */
      this.setCookieConfig = function (config) {
        cookieConfig = config;
        return this;
      };

      this.useECommerce = function (val, enhanced) {
        ecommerce = !!val;
        enhancedEcommerce = !!enhanced;
        return this;
      };

      this.setCurrency = function (currencyCode) {
        currency = currencyCode;
        return this;
      };

      this.setRemoveRegExp = function (regex) {
        if (regex instanceof RegExp) {
          removeRegExp = regex;
        }
        return this;
      };

      this.setExperimentId = function (id) {
        experimentId = id;
        return this;
      };

      this.ignoreFirstPageLoad = function (val) {
        ignoreFirstPageLoad = !!val;
        return this;
      };

      this.trackUrlParams = function (val) {
        trackUrlParams = !!val;
        return this;
      };

      this.disableAnalytics = function (val) {
        disableAnalytics = !!val;
        return this;
      };

      this.setHybridMobileSupport = function (val) {
        hybridMobileSupport = !!val;
        return this;
      };

      this.startOffline = function (val) {
        offlineMode = !!val;
        if (offlineMode === true) {
          this.delayScriptTag(true);
        }
        return this;
      };

      this.delayScriptTag = function (val) {
        delayScriptTag = !!val;
        return this;
      };

      this.logAllCalls = function (val) {
        logAllCalls = !!val;
        return this;
      };

      this.enterTestMode = function () {
        testMode = true;
        return this;
      };

      this.enterDebugMode = function (enableTraceDebugging) {
        debugMode = true;
        traceDebuggingMode = !!enableTraceDebugging;
        return this;
      };
      
      // Enable reading page url from route object
      this.readFromRoute = function(val) {
        readFromRoute = !!val;
        return this;
      };

      /**
       * Public Service
       */
      this.$get = ['$document', // To read title 
                   '$location', // 
                   '$log',      //
                   '$rootScope',// 
                   '$window',   //
                   '$injector', // To access ngRoute module without declaring a fixed dependency
                   function ($document, $location, $log, $rootScope, $window, $injector) {
        var that = this;

        /**
         * Side-effect Free Helper Methods
         **/

        var isPropertyDefined = function (key, config) {
          return angular.isObject(config) && angular.isDefined(config[key]);
        };

        var isPropertySetTo = function (key, config, value) {
          return isPropertyDefined(key, config) && config[key] === value;
        };

        var generateCommandName = function (commandName, config) {
          if (angular.isString(config)) {
            return config + '.' + commandName;
          }
          return isPropertyDefined('name', config) ? (config.name + '.' + commandName) : commandName;
        };
        
        // Try to read route configuration and log warning if not possible
        var $route = {};
        if (readFromRoute) {
          if (!$injector.has('$route')) {
            $log.warn('$route service is not available. Make sure you have included ng-route in your application dependencies.');
          } else {
            $route = $injector.get('$route');
          }
        }

        // Get url for current page 
        var getUrl = function () {
          // Using ngRoute provided tracking urls
          if (readFromRoute && $route.current && ('pageTrack' in $route.current)) {
            return $route.current.pageTrack;
          }
           
          // Otherwise go the old way
          var url = trackUrlParams ? $location.url() : $location.path(); 
          return removeRegExp ? url.replace(removeRegExp, '') : url;
        };

        var getUtmParams = function () {
          var utmToCampaignVar = {
            utm_source: 'campaignSource',
            utm_medium: 'campaignMedium',
            utm_term: 'campaignTerm',
            utm_content: 'campaignContent',
            utm_campaign: 'campaignName'
          };
          var object = {};

          angular.forEach($location.search(), function (value, key) {
            var campaignVar = utmToCampaignVar[key];

            if (angular.isDefined(campaignVar)) {
              object[campaignVar] = value;
            }
          });

          return object;
        };

        /**
         * get ActionFieldObject
         * https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce#action-data
         * @param id
         * @param affliation
         * @param revenue
         * @param tax
         * @param shipping
         * @param coupon
         * @param list
         * @param step
         * @param option
         */
        var getActionFieldObject = function (id, affiliation, revenue, tax, shipping, coupon, list, step, option) {
          var obj = {};
          if (id) { obj.id = id; }
          if (affiliation) { obj.affiliation = affiliation; }
          if (revenue) { obj.revenue = revenue; }
          if (tax) { obj.tax = tax; }
          if (shipping) { obj.shipping = shipping; }
          if (coupon) { obj.coupon = coupon; }
          if (list) { obj.list = list; }
          if (step) { obj.step = step; }
          if (option) { obj.option = option; }
          return obj;
        };

        /**
         * Private Methods
         */

        var _gaJs = function (fn) {
          if (!analyticsJS && $window._gaq && typeof fn === 'function') {
            fn();
          }
        };

        var _gaq = function () {
          var args = Array.prototype.slice.call(arguments);
          if (offlineMode === true) {
            that.offlineQueue.push([_gaq, args]);
            return;
          }
          if (!$window._gaq) {
            $window._gaq = [];
          }
          if (logAllCalls === true) {
            that._log.apply(that, args);
          }
          $window._gaq.push(args);
        };

        var _analyticsJs = function (fn) {
          if (analyticsJS && $window.ga && typeof fn === 'function') {
            fn();
          }
        };

        var _ga = function () {
          var args = Array.prototype.slice.call(arguments);
          if (offlineMode === true) {
            that.offlineQueue.push([_ga, args]);
            return;
          }
          if (typeof $window.ga !== 'function') {
            that._log('warn', 'ga function not set on window');
            return;
          }
          if (logAllCalls === true) {
            that._log.apply(that, args);
          }
          $window.ga.apply(null, args);
        };

        var _gaMultipleTrackers = function (includeFn) {
          // Drop the includeFn from the arguments and preserve the original command name
          var args = Array.prototype.slice.call(arguments, 1),
              commandName = args[0],
              trackers = [];
          if (typeof includeFn === 'function') {
            accounts.forEach(function (account) {
              if (includeFn(account)) {
                trackers.push(account);
              }
            });
          } else {
            // No include function indicates that all accounts are to be used
            trackers = accounts;
          }

          // To preserve backwards compatibility fallback to _ga method if no account
          // matches the specified includeFn. This preserves existing behaviors by
          // performing the single tracker operation.
          if (trackers.length === 0) {
            _ga.apply(that, args);
            return;
          }

          trackers.forEach(function (tracker) {
            // Check tracker 'select' function, if it exists, for whether the tracker should be used with the current command.
            // If the 'select' function returns false then the tracker will not be used with the current command.
            if (isPropertyDefined('select', tracker) && typeof tracker.select === 'function' && !tracker.select(args)) {
              return;
            }
            args[0] = generateCommandName(commandName, tracker);
            _ga.apply(that, args);
          });
        };

        this._log = function () {
          var args = Array.prototype.slice.call(arguments);
          if (args.length > 0) {
            if (args.length > 1) {
              switch (args[0]) {
                case 'debug':
                case 'error':
                case 'info':
                case 'log':
                case 'warn':
                  $log[args[0]](args.slice(1));
                  break;
              }
            }
            that.log.push(args);
          }
        };

        this._createScriptTag = function () {
          if (!accounts || accounts.length < 1) {
            that._log('warn', 'No account id set to create script tag');
            return;
          }
          if (accounts.length > 1) {
            that._log('warn', 'Multiple trackers are not supported with ga.js. Using first tracker only');
            accounts = accounts.slice(0, 1);
          }

          if (created === true) {
            that._log('warn', 'ga.js or analytics.js script tag already created');
            return;
          }

          if (disableAnalytics === true) {
            that._log('info', 'Analytics disabled: ' + accounts[0].tracker);
            $window['ga-disable-' + accounts[0].tracker] = true;
          }

          _gaq('_setAccount', accounts[0].tracker);
          if(domainName) {
            _gaq('_setDomainName', domainName);
          }
          if (enhancedLinkAttribution) {
            _gaq('_require', 'inpage_linkid', '//www.google-analytics.com/plugins/ga/inpage_linkid.js');
          }
          if (trackRoutes && !ignoreFirstPageLoad) {
            if (removeRegExp) {
              _gaq('_trackPageview', getUrl());
            } else {
              _gaq('_trackPageview');
            }
          }

          var document = $document[0];
          var scriptSource;
          if (displayFeatures === true) {
            scriptSource = ('https:' === document.location.protocol ? 'https://' : 'http://') + 'stats.g.doubleclick.net/dc.js';
          } else {
            scriptSource = ('https:' === document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
          }

          if (testMode !== true) {
            // If not in test mode inject the Google Analytics tag
            (function () {
              var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
              ga.src = scriptSource;
              var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
            })();
          } else {
            // Log the source location for validation
            that._log('inject', scriptSource);
          }

          created = true;
          return true;
        };

        this._createAnalyticsScriptTag = function () {
          if (!accounts) {
            that._log('warn', 'No account id set to create analytics script tag');
            return;
          }

          if (created === true) {
            that._log('warn', 'ga.js or analytics.js script tag already created');
            return;
          }

          if (disableAnalytics === true) {
            accounts.forEach(function (trackerObj) {
              that._log('info', 'Analytics disabled: ' + trackerObj.tracker);
              $window['ga-disable-' + trackerObj.tracker] = true;
            });
          }

          var document = $document[0];
          var protocol = hybridMobileSupport === true ? 'https:' : '';
          var scriptSource = protocol + '//www.google-analytics.com/' + (debugMode ? 'analytics_debug.js' : 'analytics.js');
          if (testMode !== true) {
            // If not in test mode inject the Google Analytics tag
            (function (i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function (){
              (i[r].q=i[r].q||[]).push(arguments);},i[r].l=1*new Date();a=s.createElement(o),
              m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m);
            })(window,document,'script',scriptSource,'ga');
          } else {
            if (typeof $window.ga !== 'function') {
              // In test mode create a ga function if none exists that is a noop sink.
              $window.ga = function () {};
            }
            // Log script injection.
            that._log('inject', scriptSource);
          }

          if (traceDebuggingMode) {
            $window.ga_debug = { trace: true };
          }

          accounts.forEach(function (trackerObj) {
            trackerObj.crossDomainLinker = isPropertyDefined('crossDomainLinker', trackerObj) ? trackerObj.crossDomainLinker : crossDomainLinker;
            trackerObj.crossLinkDomains = isPropertyDefined('crossLinkDomains', trackerObj) ? trackerObj.crossLinkDomains : crossLinkDomains;
            trackerObj.displayFeatures = isPropertyDefined('displayFeatures', trackerObj) ? trackerObj.displayFeatures : displayFeatures;
            trackerObj.enhancedLinkAttribution = isPropertyDefined('enhancedLinkAttribution', trackerObj) ? trackerObj.enhancedLinkAttribution : enhancedLinkAttribution;
            trackerObj.set = isPropertyDefined('set', trackerObj) ? trackerObj.set : {};
            trackerObj.trackEcommerce = isPropertyDefined('trackEcommerce', trackerObj) ? trackerObj.trackEcommerce : ecommerce;
            trackerObj.trackEvent = isPropertyDefined('trackEvent', trackerObj) ? trackerObj.trackEvent : false;

            // Logic to choose the account fields to be used.
            // cookieConfig is being deprecated for a tracker specific property: fields.
            var fields = {};
            if (isPropertyDefined('fields', trackerObj)) {
              fields = trackerObj.fields;
            } else if (isPropertyDefined('cookieConfig', trackerObj)) {
              if (angular.isString(trackerObj.cookieConfig)) {
                fields.cookieDomain = trackerObj.cookieConfig;
              } else {
                fields = trackerObj.cookieConfig;
              }
            } else if (angular.isString(cookieConfig)) {
              fields.cookieDomain = cookieConfig;
            } else if (cookieConfig) {
              fields = cookieConfig;
            }
            if (trackerObj.crossDomainLinker === true) {
              fields.allowLinker = true;
            }
            if (isPropertyDefined('name', trackerObj)) {
              fields.name = trackerObj.name;
            }
            trackerObj.fields = fields;

            _ga('create', trackerObj.tracker, trackerObj.fields);

            // Hybrid mobile application support
            // https://developers.google.com/analytics/devguides/collection/analyticsjs/tasks
            if (hybridMobileSupport === true) {
              _ga(generateCommandName('set', trackerObj), 'checkProtocolTask', null);
            }

            // Send all custom set commands from the trackerObj.set property
            for (var key in trackerObj.set) {
              if (trackerObj.set.hasOwnProperty(key)) {
                _ga(generateCommandName('set', trackerObj), key, trackerObj.set[key]);
              }
            }

            if (trackerObj.crossDomainLinker === true) {
              _ga(generateCommandName('require', trackerObj), 'linker');
              if (angular.isDefined(trackerObj.crossLinkDomains)) {
                _ga(generateCommandName('linker:autoLink', trackerObj), trackerObj.crossLinkDomains);
              }
            }

            if (trackerObj.displayFeatures) {
              _ga(generateCommandName('require', trackerObj), 'displayfeatures');
            }

            if (trackerObj.trackEcommerce) {
              if (!enhancedEcommerce) {
                _ga(generateCommandName('require', trackerObj), 'ecommerce');
              } else {
                _ga(generateCommandName('require', trackerObj), 'ec');
                _ga(generateCommandName('set', trackerObj), '&cu', currency);
              }
            }

            if (trackerObj.enhancedLinkAttribution) {
              _ga(generateCommandName('require', trackerObj), 'linkid');
            }

            if (trackRoutes && !ignoreFirstPageLoad) {
              _ga(generateCommandName('send', trackerObj), 'pageview', trackPrefix + getUrl());
            }
          });

          if (experimentId) {
            var expScript = document.createElement('script'),
                s = document.getElementsByTagName('script')[0];
            expScript.src = protocol + '//www.google-analytics.com/cx/api.js?experiment=' + experimentId;
            s.parentNode.insertBefore(expScript, s);
          }

          created = true;
          return true;
        };

        this._ecommerceEnabled = function (warn, command) {
          var result = ecommerce && !enhancedEcommerce;
          if (warn === true && result === false) {
            if (ecommerce && enhancedEcommerce) {
              that._log('warn', command + ' is not available when Enhanced Ecommerce is enabled with analytics.js');
            } else {
              that._log('warn', 'Ecommerce must be enabled to use ' + command + ' with analytics.js');
            }
          }
          return result;
        };

        this._enhancedEcommerceEnabled = function (warn, command) {
          var result = ecommerce && enhancedEcommerce;
          if (warn === true && result === false) {
            that._log('warn', 'Enhanced Ecommerce must be enabled to use ' + command + ' with analytics.js');
          }
          return result;
        };

        /**
         * Track page
         https://developers.google.com/analytics/devguides/collection/gajs/
         https://developers.google.com/analytics/devguides/collection/analyticsjs/pages
         * @param url
         * @param title
         * @param custom
         * @private
         */
        this._trackPage = function (url, title, custom) {
          url = url ? url : getUrl();
          title = title ? title : $document[0].title;
          _gaJs(function () {
            // http://stackoverflow.com/questions/7322288/how-can-i-set-a-page-title-with-google-analytics
            _gaq('_set', 'title', title);
            _gaq('_trackPageview', (trackPrefix + url));
          });
          _analyticsJs(function () {
            var opt_fieldObject = {
              'page': trackPrefix + url,
              'title': title
            };
            angular.extend(opt_fieldObject, getUtmParams());
            if (angular.isObject(custom)) {
              angular.extend(opt_fieldObject, custom);
            }
            _gaMultipleTrackers(undefined, 'send', 'pageview', opt_fieldObject);
          });
        };

        /**
         * Track event
         https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide
         https://developers.google.com/analytics/devguides/collection/analyticsjs/events
         * @param category
         * @param action
         * @param label
         * @param value
         * @param noninteraction
         * @param custom
         * @private
         */
        this._trackEvent = function (category, action, label, value, noninteraction, custom) {
          _gaJs(function () {
            _gaq('_trackEvent', category, action, label, value, !!noninteraction);
          });
          _analyticsJs(function () {
            var opt_fieldObject = {};
            var includeFn = function (trackerObj) {
              return isPropertySetTo('trackEvent', trackerObj, true);
            };

            if (angular.isDefined(noninteraction)) {
              opt_fieldObject.nonInteraction = !!noninteraction;
            }
            if (angular.isObject(custom)) {
              angular.extend(opt_fieldObject, custom);
            }
            if (!angular.isDefined(opt_fieldObject.page)) {
              opt_fieldObject.page = getUrl();
            }
            _gaMultipleTrackers(includeFn, 'send', 'event', category, action, label, value, opt_fieldObject);
          });
        };

        /**
         * Add transaction
         * https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiEcommerce#_gat.GA_Tracker_._addTrans
         * https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce#addTrans
         * @param transactionId
         * @param affiliation
         * @param total
         * @param tax
         * @param shipping
         * @param city
         * @param state
         * @param country
         * @private
         */
        this._addTrans = function (transactionId, affiliation, total, tax, shipping, city, state, country, currency) {
          _gaJs(function () {
            _gaq('_addTrans', transactionId, affiliation, total, tax, shipping, city, state, country);
          });
          _analyticsJs(function () {
            if (that._ecommerceEnabled(true, 'addTrans')) {
              var includeFn = function (trackerObj) {
                return isPropertySetTo('trackEcommerce', trackerObj, true);
              };

              _gaMultipleTrackers(
                includeFn,
                'ecommerce:addTransaction',
                {
                  id: transactionId,
                  affiliation: affiliation,
                  revenue: total,
                  tax: tax,
                  shipping: shipping,
                  currency: currency || 'USD'
                });
            }
          });
        };

        /**
         * Add item to transaction
         * https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiEcommerce#_gat.GA_Tracker_._addItem
         * https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce#addItem
         * @param transactionId
         * @param sku
         * @param name
         * @param category
         * @param price
         * @param quantity
         * @private
         */
        this._addItem = function (transactionId, sku, name, category, price, quantity) {
          _gaJs(function () {
            _gaq('_addItem', transactionId, sku, name, category, price, quantity);
          });
          _analyticsJs(function () {
            if (that._ecommerceEnabled(true, 'addItem')) {
              var includeFn = function (trackerObj) {
                return isPropertySetTo('trackEcommerce', trackerObj, true);
              };

              _gaMultipleTrackers(
                includeFn,
                'ecommerce:addItem',
                {
                  id: transactionId,
                  name: name,
                  sku: sku,
                  category: category,
                  price: price,
                  quantity: quantity
                });
            }
          });
        };

        /**
         * Track transaction
         * https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiEcommerce#_gat.GA_Tracker_._trackTrans
         * https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce#sendingData
         * @private
         */
        this._trackTrans = function () {
          _gaJs(function () {
            _gaq('_trackTrans');
          });
          _analyticsJs(function () {
            if (that._ecommerceEnabled(true, 'trackTrans')) {
              var includeFn = function (trackerObj) {
                return isPropertySetTo('trackEcommerce', trackerObj, true);
              };

              _gaMultipleTrackers(includeFn, 'ecommerce:send');
            }
          });
        };

        /**
         * Clear transaction
         * https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce#clearingData
         * @private
         */
        this._clearTrans = function () {
          _analyticsJs(function () {
            if (that._ecommerceEnabled(true, 'clearTrans')) {
              var includeFn = function (trackerObj) {
                return isPropertySetTo('trackEcommerce', trackerObj, true);
              };

              _gaMultipleTrackers(includeFn, 'ecommerce:clear');
            }
          });
        };

        /**
         * Enhanced Ecommerce
         */

        /**
         * Add Product
         * https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce#product-data
         * @param productId
         * @param name
         * @param category
         * @param brand
         * @param variant
         * @param price
         * @param quantity
         * @param coupon
         * @param position
         * @param custom
         * @private
         */
        this._addProduct = function (productId, name, category, brand, variant, price, quantity, coupon, position, custom) {
          _gaJs(function () {
            _gaq('_addProduct', productId, name, category, brand, variant, price, quantity, coupon, position);
          });
          _analyticsJs(function () {
            if (that._enhancedEcommerceEnabled(true, 'addProduct')) {
              var includeFn = function (trackerObj) {
                return isPropertySetTo('trackEcommerce', trackerObj, true);
              };
              var details = {
                id: productId,
                name: name,
                category: category,
                brand: brand,
                variant: variant,
                price: price,
                quantity: quantity,
                coupon: coupon,
                position: position
              };
              if (angular.isObject(custom)) {
                angular.extend(details, custom);
              }
              _gaMultipleTrackers(includeFn, 'ec:addProduct', details);
            }
          });
        };

        /**
         * Add Impression
         * https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce#impression-data
         * @param id
         * @param name
         * @param list
         * @param brand
         * @param category
         * @param variant
         * @param position
         * @param price
         * @private
         */
        this._addImpression = function (id, name, list, brand, category, variant, position, price){
          _gaJs(function () {
            _gaq('_addImpression', id, name, list, brand, category, variant, position, price);
          });
          _analyticsJs(function () {
            if (that._enhancedEcommerceEnabled(true, 'addImpression')) {
              var includeFn = function (trackerObj) {
                return isPropertySetTo('trackEcommerce', trackerObj, true);
              };

              _gaMultipleTrackers(
                includeFn,
                'ec:addImpression',
                {
                  id: id,
                  name: name,
                  category: category,
                  brand: brand,
                  variant: variant,
                  list: list,
                  position: position,
                  price: price
                });
            }
          });
        };

        /**
         * Add Promo
         * https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce
         * @param productId
         * @param name
         * @param creative
         * @param position
         * @private
         */
        this._addPromo = function (productId, name, creative, position) {
          _gaJs(function () {
            _gaq('_addPromo', productId, name, creative, position);
          });
          _analyticsJs(function () {
            if (that._enhancedEcommerceEnabled(true, 'addPromo')) {
              var includeFn = function (trackerObj) {
                return isPropertySetTo('trackEcommerce', trackerObj, true);
              };

              _gaMultipleTrackers(
                includeFn,
                'ec:addPromo',
                {
                  id: productId,
                  name: name,
                  creative: creative,
                  position: position
                });
            }
          });
        };

        /**
         * Set Action
         * https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce#measuring-actions
         * https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce#action-types
         * @param action
         * @param obj
         * @private
         */
        this._setAction = function (action, obj){
          _gaJs(function () {
            _gaq('_setAction', action, obj);
          });
          _analyticsJs(function () {
            if (that._enhancedEcommerceEnabled(true, 'setAction')) {
              var includeFn = function (trackerObj) {
                return isPropertySetTo('trackEcommerce', trackerObj, true);
              };

              _gaMultipleTrackers(includeFn, 'ec:setAction', action, obj);
            }
          });
        };

        /**
         * Track Transaction
         * https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce#measuring-transactions
         * @param transactionId
         * @param affiliation
         * @param revenue
         * @param tax
         * @param shipping
         * @param coupon
         * @param list
         * @param step
         * @param option
         * @private
         */
        this._trackTransaction = function (transactionId, affiliation, revenue, tax, shipping, coupon, list, step, option) {
          this._setAction('purchase', getActionFieldObject(transactionId, affiliation, revenue, tax, shipping, coupon, list, step, option));
        };

        /**
         * Track Refund
         * https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce#measuring-refunds
         * @param transactionId
         * @private
         */
        this._trackRefund = function (transactionId) {
          this._setAction('refund', getActionFieldObject(transactionId));
        };

        /**
         * Track Checkout
         * https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce#measuring-checkout
         * @param step
         * @param option
         * @private
         */
        this._trackCheckOut = function (step, option) {
          this._setAction('checkout', getActionFieldObject(null, null, null, null, null, null, null, step, option));
        };

        /**
         * Track detail
         * @private
         */
        this._trackDetail = function () {
          this._setAction('detail');
          this._pageView();
        };

        /**
         * Track add/remove to cart
         * https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce#add-remove-cart
         * @param action
         * @param list
         * @private
         */
        this._trackCart = function (action, listName) {
          if (['add', 'remove'].indexOf(action) !== -1) {
            this._setAction(action, { list: listName });
            this._trackEvent('UX', 'click', action + (action === 'add' ? ' to cart' : ' from cart'));
          }
        };

        /**
         * Track promo click
         * https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce#measuring-promo-clicks
         * @param promotionName
         * @private
         */
        this._promoClick = function (promotionName) {
          this._setAction('promo_click');
          this._trackEvent('Internal Promotions', 'click', promotionName);
        };

        /**
         * Track product click
         * https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce#measuring-promo-clicks
         * @param promotionName
         * @private
         */
        this._productClick = function (listName) {
          this._setAction('click', getActionFieldObject(null, null, null, null, null, null, listName, null, null));
          this._trackEvent('UX', 'click', listName);
        };

        /**
         * Send page view
         * @param trackerName
         * @private
         */
        this._pageView = function (trackerName) {
          _analyticsJs(function () {
            _ga(generateCommandName('send', trackerName), 'pageview');
          });
        };

        /**
         * Send custom events
         * https://developers.google.com/analytics/devguides/collection/analyticsjs/user-timings#implementation
         * https://developers.google.com/analytics/devguides/collection/analyticsjs/social-interactions#implementation
         * @private
         */
        this._send = function () {
          var args = Array.prototype.slice.call(arguments);
          args.unshift('send');
          _analyticsJs(function () {
            _ga.apply(that, args);
          });
        };

        /**
         * Set custom dimensions, metrics or experiment
         * https://developers.google.com/analytics/devguides/collection/analyticsjs/custom-dims-mets
         * https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#customs
         * @param name (Required)
         * @param value (Required)
         * @param trackerName (Optional)
         * @private
         */
        this._set = function (name, value, trackerName) {
          _analyticsJs(function () {
            _ga(generateCommandName('set', trackerName), name, value);
          });
        };

        /**
         * Track user timings
         * @param timingCategory (Required): A string for categorizing all user timing variables into logical groups(e.g jQuery).
         * @param timingVar (Required): A string to identify the variable being recorded(e.g. JavaScript Load).
         * @param timingValue (Required): The number of milliseconds in elapsed time to report to Google Analytics(e.g. 20).
         * @param timingLabel (Optional): A string that can be used to add flexibility in visualizing user timings in the reports(e.g. Google CDN).
         * @private
         */
        this._trackTimings = function (timingCategory, timingVar, timingValue, timingLabel) {
          _analyticsJs(function () {
            _gaMultipleTrackers(undefined, 'send', 'timing', timingCategory, timingVar, timingValue, timingLabel);
          });
        };

        /**
         * Exception tracking
         * https://developers.google.com/analytics/devguides/collection/analyticsjs/exceptions
         * @param description (Optional): A description of the exception.
         * @param isFatal (Optional): true if the exception was fatal, false otherwise.
         * @private
         */
        this._trackException = function (description, isFatal) {
          _analyticsJs(function () {
            _gaMultipleTrackers(undefined, 'send', 'exception', { exDescription: description, exFatal: !!isFatal});
          });
        };

        // creates the Google Analytics tracker
        if (!delayScriptTag) {
          if (analyticsJS) {
            this._createAnalyticsScriptTag();
          } else {
            this._createScriptTag();
          }
        }

        // activates page tracking
        if (trackRoutes) {
          $rootScope.$on(pageEvent, function () {
            // Apply $route based filtering if configured
            if (readFromRoute) {
              // Avoid tracking undefined routes, routes without template (e.g. redirect routes)
              // and those explicitly marked as 'do not track'
              if (!$route.current || !$route.current.templateUrl || $route.current.doNotTrack) {
                return;
              }
            }
            
            that._trackPage();
          });
        }

        return {
          log: that.log,
          offlineQueue: that.offlineQueue,
          configuration: {
            accounts: accounts,
            universalAnalytics: analyticsJS,
            crossDomainLinker: crossDomainLinker,
            crossLinkDomains: crossLinkDomains,
            currency: currency,
            debugMode: debugMode,
            delayScriptTag: delayScriptTag,
            disableAnalytics: disableAnalytics,
            displayFeatures: displayFeatures,
            domainName: domainName,
            ecommerce: that._ecommerceEnabled(),
            enhancedEcommerce: that._enhancedEcommerceEnabled(),
            enhancedLinkAttribution: enhancedLinkAttribution,
            experimentId: experimentId,
            hybridMobileSupport: hybridMobileSupport,
            ignoreFirstPageLoad: ignoreFirstPageLoad,
            logAllCalls: logAllCalls,
            pageEvent: pageEvent,
            readFromRoute: readFromRoute,
            removeRegExp: removeRegExp,
            testMode: testMode,
            traceDebuggingMode: traceDebuggingMode,
            trackPrefix: trackPrefix,
            trackRoutes: trackRoutes,
            trackUrlParams: trackUrlParams
          },
          getUrl: getUrl,
          /* DEPRECATED */
          setCookieConfig: that._setCookieConfig,
          /* DEPRECATED */
          getCookieConfig: function () {
            return cookieConfig;
          },
          createAnalyticsScriptTag: function (config) {
            if (config) {
              cookieConfig = config;
            }
            return that._createAnalyticsScriptTag();
          },
          createScriptTag: function () {
            return that._createScriptTag();
          },
          offline: function (mode) {
            if (mode === true && offlineMode === false) {
              // Go to offline mode
              offlineMode = true;
            }
            if (mode === false && offlineMode === true) {
              // Go to online mode and process the offline queue
              offlineMode = false;
              while (that.offlineQueue.length > 0) {
                var obj = that.offlineQueue.shift();
                obj[0].apply(that, obj[1]);
              }
            }
            return offlineMode;
          },
          trackPage: function (url, title, custom) {
            that._trackPage.apply(that, arguments);
          },
          trackEvent: function (category, action, label, value, noninteraction, custom) {
            that._trackEvent.apply(that, arguments);
          },
          addTrans: function (transactionId, affiliation, total, tax, shipping, city, state, country, currency) {
            that._addTrans.apply(that, arguments);
          },
          addItem: function (transactionId, sku, name, category, price, quantity) {
            that._addItem.apply(that, arguments);
          },
          trackTrans: function () {
            that._trackTrans.apply(that, arguments);
          },
          clearTrans: function () {
            that._clearTrans.apply(that, arguments);
          },
          addProduct: function (productId, name, category, brand, variant, price, quantity, coupon, position, custom) {
            that._addProduct.apply(that, arguments);
          },
          addPromo: function (productId, name, creative, position) {
            that._addPromo.apply(that, arguments);
          },
          addImpression: function (productId, name, list, brand, category, variant, position, price) {
            that._addImpression.apply(that, arguments);
          },
          productClick: function (listName) {
            that._productClick.apply(that, arguments);
          },
          promoClick : function (promotionName) {
            that._promoClick.apply(that, arguments);
          },
          trackDetail: function () {
            that._trackDetail.apply(that, arguments);
          },
          trackCart: function (action, list) {
            that._trackCart.apply(that, arguments);
          },
          trackCheckout: function (step, option) {
            that._trackCheckOut.apply(that, arguments);
          },
          trackTimings: function (timingCategory, timingVar, timingValue, timingLabel) {
            that._trackTimings.apply(that, arguments);
          },
          trackTransaction: function (transactionId, affiliation, revenue, tax, shipping, coupon, list, step, option) {
            that._trackTransaction.apply(that, arguments);
          },
          trackException: function (description, isFatal) {
            that._trackException.apply(that, arguments);
          },
          setAction: function (action, obj) {
            that._setAction.apply(that, arguments);
          },
          pageView: function () {
            that._pageView.apply(that, arguments);
          },
          send: function (obj) {
            that._send.apply(that, arguments);
          },
          set: function (name, value, trackerName) {
            that._set.apply(that, arguments);
          }
        };
      }];
    })

    .directive('gaTrackEvent', ['Analytics', '$parse', function (Analytics, $parse) {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          var options = $parse(attrs.gaTrackEvent);
          element.bind('click', function () {
            if(attrs.gaTrackEventIf){
              if(!scope.$eval(attrs.gaTrackEventIf)){
                return; // Cancel this event if we don't pass the ga-track-event-if condition
              }
            }
            if (options.length > 1) {
              Analytics.trackEvent.apply(Analytics, options(scope));
            }
          });
        }
      };
    }]);
  return angular.module('angular-google-analytics');
}));
