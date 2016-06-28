"use strict";

var app = angular.module('wecoApp', ['config', 'ui.router', 'ngAnimate', 'api']);
app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/');

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
    });

    $urlRouterProvider.otherwise(function($injector, $location) {
      var state = $injector.get('$state');
      state.go('weco.notfound');
      return $location.path();
    });
});

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

  var modalResolve;
  var modalReject;
  Modal.open = function(url, args) {
    templateUrl = url;
    isOpen = true;
    modalInputArgs = args;

    return new Promise(function(resolve, reject) {
      modalResolve = resolve;
      modalReject = reject;
    });
  };

  Modal.OK = function() {
    $timeout(function() {
      isOpen = false;
    });
    modalResolve(true);
  };
  Modal.Cancel = function() {
    $timeout(function() {
      isOpen = false;
    });
    modalResolve(false);
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
      states: '&'
    },
    templateUrl: '/app/components/tabs/tabs.view.html',
    link: function($scope, element, attrs) {
      $scope.isSelected = function(index) {
        return $state.current.name == $scope.states()[index];
      };
    }
  };
}]);

"use strict";

 angular.module('config', [])

.constant('ENV', {name:'development',apiEndpoint:'http://api-dev.eu9ntpt33z.eu-west-1.elasticbeanstalk.com/'})

;
var api = angular.module('api', ['ngResource']);
api.config(['$httpProvider', function($httpProvider) {
  // must set withCredentials to keep cookies when making API requests
  $httpProvider.defaults.withCredentials = true;
}]);

'use strict';

var api = angular.module('api');
api.factory('UserAPI', ['$resource', 'ENV', function($resource, ENV) {

  function makeFormEncoded(data, headersGetter) {
    var str = [];
    for (var d in data)
      str.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    return str.join("&");
  }

  var User = $resource(ENV.apiEndpoint + 'user/:param',
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

   return User;
}]);

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
    if($scope.isLoginForm()) {
      login();
    } else {
      signup();
    }
  };
}]);

'use strict';

var app = angular.module('wecoApp');
app.controller('profileController', ['$scope', '$timeout', '$state', 'User', function($scope, $timeout, $state, User) {
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
        console.log('error');
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
