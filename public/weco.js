"use strict";

var app = angular.module('wecoApp', ['config', 'ui.router', 'ngAnimate', 'ngSanitize', 'ngFileUpload', 'api']);
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
      template: '<nav-bar></nav-bar><div class="full-page-nav" ui-view></div>'
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
      url: '',
      templateUrl: '/app/pages/profile/about/about.view.html'
    })
    .state('weco.profile.timeline', {
      templateUrl: '/app/pages/profile/timeline/timeline.view.html'
    })
    .state('weco.profile.settings', {
      templateUrl: '/app/pages/profile/settings/settings.view.html'
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
      templateUrl: '/app/pages/branch/wall/wall.view.html'
    });

    $urlRouterProvider.otherwise(function($injector, $location) {
      var state = $injector.get('$state');
      state.go('weco.notfound');
      return $location.path();
    });
});

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
        $scope.selected = idx;
        $scope.close();
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
app.directive('loading', function() {
  return {
    restrict: 'A',
    templateUrl: '/app/components/loading/loading.view.html',
    scope: {
      when: '&'
    },
    replace: false,
    transclude: true
  };
});

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
          ' made a SubBranch Request to ' +
          '<a ui-sref="weco.branch.nucleus.about({ branchid: entry.data })">{{ entry.data }}</a>.' +
        '</div>';
    case 'answer-subbranch-request':
      var data = JSON.parse(entry.data);
      return templateStr +
        '<div class="entry">' +
          '<a ui-sref="weco.profile.about({ username: entry.username })">{{ entry.username }}</a> ' +
           data.response + 'ed a SubBranch Request to ' +
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
app.directive('navBar', ['User', '$state', function(User, $state) {
  return {
    restrict: 'E',
    replace: 'true',
    templateUrl: '/app/components/nav/nav.view.html',
    link: function($scope, element, attrs) {
      $scope.user = User.me;
      $scope.isLoggedIn = User.isLoggedIn;
      $scope.logout = function() {
        User.logout().then(function() {
          // successful logout; go to login page
          $state.go('auth.login');
        }, function() {
          // TODO: pretty error
          alert('Unable to log out!');
        });
      };
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
api.factory('ModLogAPI', ['$resource', 'ENV', function($resource, ENV) {
  return $resource(ENV.apiEndpoint + 'branch/:branchid/modlog', {}, {});
}]);

var api = angular.module('api');
api.factory('ModsAPI', ['$resource', 'ENV', function($resource, ENV) {
  return $resource(ENV.apiEndpoint + 'branch/:branchid/mods/:username', {}, {});
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
app.factory('Branch', ['BranchAPI', 'SubbranchesAPI', 'ModLogAPI', 'SubbranchRequestAPI', '$http', '$state', 'ENV', function(BranchAPI, SubbranchesAPI, ModLogAPI, SubbranchRequestAPI, $http, $state, ENV) {
  var Branch = {};
  var me = {};

  // fetch the presigned url for the specified picture for the specified branch
  // Returns the promise from $http.
  Branch.getPictureUrl = function(id, type) {
    // if type not specified, default to profile picture
    if(type != 'picture' && type != 'cover') {
      type = 'picture';
    }
    // fetch signedurl for user profile picture and attach to user object
    return $http({
      method: 'GET',
      url: ENV.apiEndpoint + 'branch/' + id + '/' + type
    });
  };

  Branch.get = function(branchid) {
    return new Promise(function(resolve, reject) {
      BranchAPI.get({ branchid: branchid }, function(branch) {
        if(!branch || !branch.data) { return reject(); }
        // Attach the profile picture and cover urls to the branch object if they exist
        Branch.getPictureUrl(branchid, 'picture').then(function(response) {
          if(response && response.data && response.data.data) {
            branch.data.profileUrl = response.data.data;
          }
          return Branch.getPictureUrl(branchid, 'cover');
        }).then(function(response) {
          if(response && response.data && response.data.data) {
            branch.data.coverUrl = response.data.data;
          }
          resolve(branch.data);
        }).catch(function () {
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

  return Branch;
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
app.factory('User', ['UserAPI', '$http', 'ENV', function(UserAPI, $http, ENV) {
  var User = {};
  var me = {};

  // fetch the presigned url for the profile picture for the specified user,
  // defaulting to authd user if not specified.
  // Returns the promise from $http.
  function getPictureUrl(username, type) {
    // if no username specified, fetch self
    if(!username) {
      username = 'me';
    }

    // if type not specified, default to profile picture
    if(type != 'picture' && type != 'cover') {
      type = 'picture';
    }
    // fetch signedurl for user profile picture and attach to user object
    return $http.get(ENV.apiEndpoint + 'user/' + username + '/' + type);
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
        getPictureUrl('me', 'picture').then(function(response) {
          if(response && response.data && response.data.data) {
            user.data.profileUrl = response.data.data;
          }
          getPictureUrl('me', 'cover').then(function(response) {
            if(response && response.data && response.data.data) {
              user.data.coverUrl = response.data.data;
            }
            me.data = user.data;
            resolve();
          }, function() {
            // no cover picture to attach
            me.data = user.data;
            resolve();
          });
        }, function() {
          // no profile picture to attach, try cover
          getPictureUrl('me', 'cover').then(function(response) {
            if(response && response.data && response.data.data) {
              user.data.coverUrl = response.data.data;
            }
            me.data = user.data;
            resolve();
          }, function() {
            // no cover picture to attach
            me.data = user.data;
            resolve();
          });
        });
      });
    });
  }
  getMe().then(function() {}, function () {
    console.error("Unable to get user!");
  });

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
          getPictureUrl(username, 'picture').then(function(response) {
            if(response && response.data && response.data.data) {
              user.data.profileUrl = response.data.data;
            }
            getPictureUrl(username, 'cover').then(function(response) {
              if(response && response.data && response.data.data) {
                user.data.coverUrl = response.data.data;
              }
              resolve(user.data);
            }, function() {
              // no cover picture to attach
              resolve(user.data);
            });
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
app.controller('branchController', ['$scope', '$state', '$timeout', 'Branch', 'Mod', 'User', 'Modal', function($scope, $state, $timeout, Branch, Mod, User, Modal) {
  $scope.branchid = $state.params.branchid;
  $scope.isLoading = true;

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
            $state.go('weco.branch.subbranches', { branchid: Modal.getOutputArgs().branchid });
          } else {
            $state.go($state.current, {}, {reload: true});
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
app.controller('subbranchesController', ['$scope', '$state', '$timeout', 'Branch', function($scope, $state, $timeout, Branch) {
  $scope.tabItems = ['all time', 'this year', 'this month', 'this week', 'today', 'this hour'];
  $scope.tabStates =
    ['weco.branch.subbranches({ "branchid": "' + $scope.branchid + '" })',
     'weco.branch.subbranches({ "branchid": "' + $scope.branchid + '" })',
     'weco.branch.subbranches({ "branchid": "' + $scope.branchid + '" })',
     'weco.branch.subbranches({ "branchid": "' + $scope.branchid + '" })',
     'weco.branch.subbranches({ "branchid": "' + $scope.branchid + '" })',
     'weco.branch.subbranches({ "branchid": "' + $scope.branchid + '" })'];

  $scope.isLoading = true;
  $scope.branches = [];

  // Asynchronously load the branch images one by one
  function loadBranchPictures(branches, idx) {
    var target = branches.shift();
    if(target) {
      Branch.getPictureUrl($scope.branches[idx].id, 'picture').then(function(response) {
        if(response && response.data && response.data.data) {
          $scope.branches[idx].profileUrl = response.data.data;
        }
        loadBranchPictures(branches, idx + 1);
      }, function () {
        // Unable to fetch this picture - continue
        loadBranchPictures(branches, idx + 1);
      });
    }
  }

  function getSubbranches() {
    // compute the appropriate timeafter for the selected time filter
    var timeafter;
    var date = new Date();
    switch($scope.timeItems[$scope.selectedTimeItemIdx]) {
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
        timeafter = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay(), 0, 0, 0, 0).getTime();
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


  // Time filter dropdown configuration
  $scope.timeTitle = 'TIME RANGE';
  $scope.timeItems = ['ALL TIME', 'THIS YEAR', 'THIS MONTH', 'THIS WEEK', 'LAST 24 HRS', 'THIS HOUR'];
  $scope.selectedTimeItemIdx = 0;
  $scope.$watch('selectedTimeItemIdx', function () {
    getSubbranches();
  });

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
