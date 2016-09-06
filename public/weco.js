"use strict";

var app = angular.module('wecoApp', ['config', 'ui.router', 'ngAnimate', 'ngSanitize', 'ngFileUpload', 'hc.marked', 'api']);
// configure notification type constants (matches server)
app.constant('NotificationTypes', {
  'NEW_CHILD_BRANCH_REQUEST': 0,
  'CHILD_BRANCH_REQUEST_ANSWERED': 1,
  'BRANCH_MOVED': 2,
  'MODERATOR': 3,
  'COMMENT': 4
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

app.run(['$rootScope', '$state', 'User', 'Mod', 'socket', function($rootScope, $state, User, Mod, socket) {

  socket.on('on_connect', 'notifications', function(data) {
    console.log("Connection established");
    User.get().then(function(me) {
      if(!me.username) { throw 'Not Authenticated'; }
      return User.subscribeToNotifications(me.username, data.id);
    }).then(function() {
      console.log("Successfully subscribed to notifications");
    }).catch(function(err) {
      // TODO pretty error
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
        // TODO pretty error
        console.error("Error unsubscribing to notifications: ", err);
      });
    } else {
      // TODO pretty error
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

  // socket.on(event, namespace).then()
  /*  socket.io().notifications.on/emit etc
  **  socket.reconnect()
  **  socket.disconnect
  */
}]);

app.controller('rootController', ['$scope', '$state', 'ENV', function($scope, $state, ENV) {
  $scope.socketioURL = ENV + 'socket.io/socket.io.js';

  $scope.hasNavBar = function() {
    if($state.current.name.indexOf('auth') > -1) {
      return false;
    } else {
      return true;
    }
  };
}]);

var app = angular.module('wecoApp');
app.directive('commentThread', ['$state', 'Comment', 'User', '$timeout', function($state, Comment, User, $timeout) {
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
            // TODO: pretty error
            console.error("Unable to reload comment!");
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


      // Asynchronously load the comments's data one by one
      // The 'scope' is the bound comment object onto which the data should be attached
      function loadCommentData(scope, comments, idx) {
        var target = comments.shift();
        if(target) {
          Comment.get(scope.postid, scope.comments[idx].id).then(function(response) {
            if(response) {
              $timeout(function() {
                scope.comments[idx].data = response.data;
                scope.comments[idx].isLoading = false;
              });
            }
            // continue
            loadCommentData(scope, comments, idx + 1);
          }).catch(function () {
            // Unable to fetch this comment data - continue
            loadCommentData(scope, comments, idx + 1);
          });
        }
      }

      function getReplies(comment) {
        // fetch the replies to this comment, or just the number of replies
        Comment.getMany(comment.postid, comment.id, $scope.sortBy.toLowerCase()).then(function(response) {
          $timeout(function() {
            comment.comments = response;
            // set all comments to loading until their content is retrieved
            for(var i = 0; i < comment.comments.length; i++) {
              comment.comments[i].isLoading = true;
            }
            // slice() provides a clone of the comments array
            loadCommentData(comment, response.slice(), 0);
          });
        }, function() {
          // TODO: pretty error
          console.error("Unable to get replies!");
        });
      }

      $scope.loadMore = function(comment) {
        getReplies(comment);
      };

      $scope.vote = function(comment, direction) {
        Comment.vote(comment.postid, comment.id, direction).then(function() {
          var inc = (direction == 'up') ? 1 : -1;
          $timeout(function() {
            comment.individual += inc;
          });
        }, function(err) {
          // TODO: pretty error
          console.error("Unable to vote on comment!");
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
      // TODO: pretty error
      console.error("Unable to get mod!");
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
        Modal.OK();
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
        // TODO: pretty error
        console.error("Unable to get branch!");
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
      // NB: a single failed promise will result in error!
      $timeout(function() {
        $scope.errorMessage = 'Unable to fetch SubBranch requests.';
        $scope.isLoading = false;
      });
    });
  }, function () {
    // TODO: pretty error
    console.error("Unable to get subbranch requests!");
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
    branchids: [Modal.getInputArgs().branchid]
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
          // TODO: handle error
          $scope.file = null;
          $scope.isUploading = false;
          $scope.progress = 0;
          console.error("Unable to upload photo!");
        }, function(evt) {
          $scope.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });
      } else {
        // TODO: handle error
        console.log("error");
      }
    }, function () {
      // TODO: handle error
      console.log("error");
    });
  };

  $scope.$on('OK', function() {
    // if not all fields are filled, display message
    if(!$scope.newPost || !$scope.newPost.title || !$scope.newPost.branchids ||
       $scope.newPost.branchids.length === 0 || !$scope.newPost.text) {
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
          // TODO: handle error
          console.log("error");
        }
      }, function () {
        // TODO: handle error
        console.log("error");
      });
    }
  });

  $scope.setFile = function(file) {
    $scope.file = file;
  };

  $scope.upload = function() {
    if(!$scope.file) {
      console.error("No file selected");
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
      // TODO: handle error
      $scope.file = null;
      $scope.isUploading = false;
      $scope.progress = 0;
      console.error("Unable to upload photo!");
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
      console.error("No file selected");
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
app.directive('navBar', ['User', '$state', '$timeout', 'socket', function(User, $state, $timeout, socket) {
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
          // TODO: pretty error
          alert('Unable to log out!');
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
          // TODO pretty error
          console.error("Error fetching notification count");
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
    }
  };
}]);

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
app.controller('writeCommentController', ['$scope', '$timeout', 'Comment', function($scope, $timeout, Comment) {
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
        // TODO pretty err
        console.log(err);

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
        // TODO pretty err
        console.log(err);

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

.constant('ENV', {name:'local',apiEndpoint:'http://localhost:8080/'})

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
  Branch.getSubbranches = function(branchid, timeafter) {
    return new Promise(function(resolve, reject) {
      SubbranchesAPI.get({ branchid: branchid, timeafter: timeafter }, function(branches) {
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
  Branch.getPosts = function(branchid, timeafter, sortBy, stat) {
    return new Promise(function(resolve, reject) {
      BranchPostsAPI.get({ branchid: branchid, timeafter: timeafter, sortBy: sortBy, stat: stat }, function(posts) {
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
  Comment.getMany = function(postid, parentid, sortBy) {
    return new Promise(function(resolve, reject) {
      CommentAPI.get({ postid: postid, parentid: parentid, sort: sortBy }, function(comments) {
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

  User.getNotifications = function(username, unreadCount) {
    return new Promise(function(resolve, reject) {
      UserNotificationsAPI.get({
        username: username,
        unreadCount: unreadCount
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

  return User;
}]);

'use strict';

var app = angular.module('wecoApp');
app.controller('authController', ['$scope', '$state', 'User', function($scope, $state, User) {
  $scope.credentials = {};
  $scope.user = User.me;
  $scope.isLoading = false;
  $scope.errorMessage = '';

  $scope.isLoginForm = function() {
    return $state.current.name == 'auth.login';
  };

  function login() {
    User.login($scope.credentials).then(function() {
      // successful login; redirect to home page
      $scope.isLoading = false;
      $state.go('weco.home');
    }, function(response) {
      $scope.errorMessage = response.message;
      $scope.isLoading = false;
    });
  }

  function signup() {
    User.signup($scope.credentials).then(function() {
      // successful signup; redirect to home page
      $scope.isLoading = false;
      $state.go('weco.home');
    }, function(response) {
      $scope.errorMessage = response.message;
      $scope.isLoading = false;
    });
  }

  $scope.submit = function() {
    $scope.isLoading = true;
    $scope.credentials.username = $scope.credentials.username.toLowerCase();
    if($scope.isLoginForm()) {
      login();
    } else {
      signup();
    }
  };
}]);

'use strict';

var app = angular.module('wecoApp');
app.controller('branchController', ['$scope', '$rootScope', '$state', '$timeout', 'Branch', 'Mod', 'User', 'Modal', function($scope, $rootScope, $state, $timeout, Branch, Mod, User, Modal) {
  $scope.branchid = $state.params.branchid;
  $scope.isLoading = true;

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
    $scope.isLoading = false;
  });

  $scope.openProfilePictureModal = function() {
    Modal.open('/app/components/modals/upload/upload-image.modal.view.html', { route: 'branch/' + $scope.branchid + '/', type: 'picture' })
      .then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        // TODO: display pretty message
        console.log('error');
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
        // TODO: display pretty message
        console.log('error');
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
        // TODO: display pretty message
        console.log('error');
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
        // TODO: display pretty message
        console.log('error');
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
        if($scope.branchid != 'root') {
          createPost();
        }
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

'use strict';

var app = angular.module('wecoApp');
app.controller('nucleusModeratorsController', ['$scope', '$state', '$timeout', 'User', 'Branch', function($scope, $state, $timeout, User, Branch) {
  $scope.mods = [];
  $scope.isLoading = true;

  $scope.getMod = function(username, index) {
    var p = User.get(username);
    p.then(function(data) {
      $timeout(function() {
        $scope.mods[index] = data;
      });
    }, function () {
      // TODO: pretty error
      console.error("Unable to get mod!");
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
    // TODO: pretty error
    console.error("Unable to fetch mods!");
    $scope.isLoading = false;
  });
}]);

var app = angular.module('wecoApp');
app.controller('nucleusModToolsController', ['$scope', '$state', '$timeout', 'Modal', 'User', 'Branch', function($scope, $state, $timeout, Modal, User, Branch) {
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
    // TODO: pretty error
    console.error("Unable to fetch mod log.");
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
        // TODO: display pretty message
        console.error('Error updating moderator settings');
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

    // a list of mods to be removed; not self, and must be added after self
    var removableMods = [];
    for(var i = 0; i < $scope.branch.mods.length; i++) {
      if($scope.branch.mods[i].date > me.date && $scope.branch.mods[i].username !== me.username) {
        removableMods.push($scope.branch.mods[i]);
      }
    }

    Modal.open('/app/components/modals/branch/nucleus/modtools/remove-mod/remove-mod.modal.view.html',
      {
        branchid: $scope.branchid,
        mods: removableMods
      }).then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        // TODO: display pretty message
        console.error('Error updating moderator settings');
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
        // TODO: display pretty message
        console.error('Error submitting subbranch request');
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
        // TODO: display pretty message
        console.error('Error responding to subbranch request');
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
        // TODO: display pretty message
        console.error('Error deleting branch');
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
app.controller('nucleusSettingsController', ['$scope', '$state', '$timeout', 'Modal', function($scope, $state, $timeout, Modal) {

  function openModal(args) {
    Modal.open('/app/components/modals/branch/nucleus/settings/settings.modal.view.html', args)
      .then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        // TODO: display pretty message
        console.error('Error updating branch settings');
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
app.controller('postController', ['$scope', '$rootScope', '$state', '$timeout', 'Post', 'Comment', function($scope, $rootScope, $state, $timeout, Post, Comment) {
  $scope.isLoadingPost = true;
  $scope.isLoadingComments = true;
  $scope.post = {};
  $scope.comments = [];
  $scope.markdownRaw = '';
  $scope.videoEmbedURL = '';
  $scope.previewState = 'show'; // other states: 'show', 'maximise'

  // Time filter dropdown configuration
  $scope.sortItems = ['POINTS', 'REPLIES', 'DATE'];
  $scope.selectedSortItemIdx = 0;

  // watch for change in drop down menu sort by selection
  $scope.selectedSortItemIdx = 0;
  $scope.$watch('selectedSortItemIdx', function () {
    getComments();
  });

  // when a new comment is posted, reload the comments
  $scope.onSubmitComment = function() {
    getComments();
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
    }, function(err) {
      // TODO: pretty error
      console.error("Unable to vote on post!");
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
    // TODO: handle other error codes
    // post not found - 404
    if(response.status == 404) {
      $state.go('weco.notfound');
    }
    $scope.isLoadingPost = false;
  });

  // Asynchronously load the comments's data one by one
  function loadCommentData(comments, idx) {
    var target = comments.shift();
    if(target) {
      Comment.get($state.params.postid, $scope.comments[idx].id).then(function(response) {
        if(response) {
          $timeout(function() {
            $scope.comments[idx].data = response.data;
            $scope.comments[idx].isLoading = false;
          });
        }
        loadCommentData(comments, idx + 1);
      }).catch(function () {
        // Unable to fetch this comment data - continue
        loadCommentData(comments, idx + 1);
      });
    }
  }

  function getComments() {
    if($scope.isCommentPermalink()) {
      // fetch the permalinked comment
      Comment.get($state.params.postid, $state.params.commentid).then(function(comment) {
        $timeout(function() {
          $scope.comments = [comment];
          $scope.isLoadingComments = false;
          // set all comments to loading until their content is retrieved
          for(var i = 0; i < $scope.comments.length; i++) {
            $scope.comments[i].isLoading = true;
          }
          // slice() provides a clone of the comments array
          loadCommentData($scope.comments.slice(), 0);
        });
      }, function() {
        // TODO: pretty error
        console.error("Unable to get comments!");
        $scope.isLoadingComments = false;
      });
    } else {
      // fetch all the comments for this post
      var sortBy = $scope.sortItems[$scope.selectedSortItemIdx].toLowerCase();
      Comment.getMany($state.params.postid, undefined, sortBy).then(function(comments) {
        $timeout(function() {
          $scope.comments = comments;
          $scope.isLoadingComments = false;
          // set all comments to loading until their content is retrieved
          for(var i = 0; i < $scope.comments.length; i++) {
            $scope.comments[i].isLoading = true;
          }
          // slice() provides a clone of the comments array
          loadCommentData($scope.comments.slice(), 0);
        });
      }, function() {
        // TODO: pretty error
        console.error("Unable to get comments!");
        $scope.isLoadingComments = false;
      });
    }
  }

  // reload the comments on any state change
  // (when first navigated to AND when going to/from comment permalink state)
  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams, options) {
    getComments();
  });
}]);

'use strict';

var app = angular.module('wecoApp');
app.controller('subbranchesController', ['$scope', '$state', '$timeout', 'Branch', function($scope, $state, $timeout, Branch) {
  $scope.isLoading = true;
  $scope.branches = [];

  // Asynchronously load the branch images one by one
  function loadBranchPictures(branches, idx) {
    var target = branches.shift();
    if(target) {
      Branch.getPictureUrl($scope.branches[idx].id, 'picture', false).then(function(response) {
        if(response && response.data && response.data.data) {
          $timeout(function() {
            $scope.branches[idx].profileUrl = response.data.data;
          });
        }
        return Branch.getPictureUrl($scope.branches[idx].id, 'picture', true);
      }).then(function(response) {
        if(response && response.data && response.data.data) {
          $timeout(function() {
            $scope.branches[idx].profileUrlThumb = response.data.data;
          });
        }
        loadBranchPictures(branches, idx + 1);
      }).catch(function () {
        // Unable to fetch this picture - continue
        loadBranchPictures(branches, idx + 1);
      });
    }
  }

  function getSubbranches() {
    // compute the appropriate timeafter for the selected time filter
    var timeafter = $scope.getTimeafter($scope.timeItems[$scope.selectedTimeItemIdx]);

    // fetch the subbranches for this branch and timefilter
    Branch.getSubbranches($scope.branchid, timeafter).then(function(branches) {
      $timeout(function() {
        $scope.branches = branches;
        $scope.isLoading = false;
        // slice() provides a clone of the branches array
        loadBranchPictures($scope.branches.slice(), 0);
      });
    }, function() {
      // TODO: pretty error
      console.error("Unable to get branches!");
      $scope.isLoading = false;
    });
  }

  // watch for change in drop down menu time filter selection
  $scope.selectedTimeItemIdx = 0;
  $scope.$watch('selectedTimeItemIdx', function () {
    getSubbranches();
  });

}]);

'use strict';

var app = angular.module('wecoApp');
app.controller('wallController', ['$scope', '$state', '$timeout', 'Branch', 'Post', function($scope, $state, $timeout, Branch, Post) {
  $scope.isLoading = false;
  $scope.posts = [];
  $scope.stat = 'global';

  $scope.vote = function(post, direction) {
    Post.vote($scope.branchid, post.id, direction).then(function() {
      var inc = (direction == 'up') ? 1 : -1;
      $timeout(function() {
        post.individual += inc;
        post.local += inc;
        post.global += inc;
      });
    }, function(err) {
      // TODO: pretty error
      console.error("Unable to vote on post!");
    });
  };

  $scope.setStat = function(stat) {
    $scope.isLoading = true;
    $scope.stat = stat;
    getPosts();
  };

  // return the correct ui-sref string for when the specified post is clicked
  $scope.getLink = function(post) {
    if(post.type == 'text') {
      return $state.href('weco.branch.post', { postid: post.id });
    }
    return post.text;
  };

  // Asynchronously load the post's data one by one
  function loadPostData(posts, idx) {
    var target = posts.shift();
    if(target) {
      Post.get($scope.posts[idx].id).then(function(response) {
        if(response) {
          $timeout(function() {
            var global_stat = $scope.posts[idx].global;
            $scope.posts[idx] = response;
            $scope.posts[idx].global = global_stat;
            $scope.posts[idx].isLoading = false;
          });
        }
        loadPostData(posts, idx + 1);
      }).catch(function () {
        // Unable to fetch this post data - continue
        loadPostData(posts, idx + 1);
      });
    }
  }

  function getPosts() {
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
      default:
        sortBy = 'points';
        break;
    }

    // fetch the posts for this branch and timefilter
    Branch.getPosts($scope.branchid, timeafter, sortBy, $scope.stat).then(function(posts) {
      $timeout(function() {
        $scope.posts = posts;
        $scope.isLoading = false;
        // set all posts to loading until their content is retrieved
        for(var i = 0; i < $scope.posts.length; i++) {
          $scope.posts[i].isLoading = true;
        }
        // slice() provides a clone of the posts array
        loadPostData($scope.posts.slice(), 0);
      });
    }, function() {
      // TODO: pretty error
      console.error("Unable to get posts!");
      $scope.isLoading = false;
    });
  }

  // watch for change in drop down menu time filter selection
  $scope.selectedTimeItemIdx = 0;
  $scope.$watch('selectedTimeItemIdx', function () {
    getPosts();
  });

  $scope.postTypeItems = ['ALL', 'TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'PAGE'];
  $scope.selectedPostTypeItemIdx = 0;

  $scope.sortByItems = ['TOTAL POINTS', 'NUMBER OF COMMENTS', 'POINTS ON COMMENTS', 'DATE'];
  $scope.selectedSortByItemIdx = 0;

  $scope.$watch('selectedSortByItemIdx', function () {
    if($scope.sortByItems[$scope.selectedSortByItemIdx] != 'TOTAL POINTS') {
      $scope.setStat('individual');
    }
    getPosts();
  });
}]);

var app = angular.module('wecoApp');
app.controller('profileNotificationsController', ['$scope', '$state', '$timeout', 'User', 'NotificationTypes', function($scope, $state, $timeout, User, NotificationTypes) {
  $scope.isLoading = false;
  $scope.NotificationTypes = NotificationTypes;
  $scope.me = User.me;
  $scope.notifications = [];

  function getNotifications() {
    $scope.isLoading = true;

    User.getNotifications($state.params.username).then(function(notifications) {
      $timeout(function() {
        $scope.notifications = notifications;
        $scope.isLoading = false;
      });
    }, function() {
      // TODO pretty error
      console.error('Unable to fetch notifications');
    });
  }

  $scope.setUnread = function(notification, unread) {
    User.markNotification(User.me().username, notification.id, unread).then(function() {
      $timeout(function() {
        notification.unread = unread;
      });
    }, function(err) {
      // TODO handle error
      console.error("Unable to mark notification! ", err);
    });
  };

  // initial fetch of notifications
  getNotifications();
}]);

'use strict';

var app = angular.module('wecoApp');
app.controller('profileController', ['$scope', '$timeout', '$state', 'User', 'Modal', function($scope, $timeout, $state, User, Modal) {
  $scope.user = {};
  $scope.isLoading = true;

  User.get($state.params.username).then(function(user) {
    $timeout(function() {
      $scope.user = user;
      $scope.isLoading = false;
    });
  }, function(response) {
    // TODO: Handle other error codes
    if(response.status == 404) {
      $state.go('weco.notfound');
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
        // TODO: display pretty message
        console.log('error');
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
        // TODO: display pretty message
        console.log('error');
      });
  };

  $scope.isMyProfile = function() {
    return User.me().username == $state.params.username;
  };
}]);

var app = angular.module('wecoApp');
app.controller('profileSettingsController', ['$scope', '$state', 'Modal', function($scope, $state, Modal) {
  function openModal(args) {
    Modal.open('/app/components/modals/profile/settings/settings.modal.view.html', args)
      .then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        // TODO: display pretty message
        console.error('Error updating profile settings');
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
}]);
