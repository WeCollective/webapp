"use strict";

var app = angular.module('wecoApp', ['config', 'ui.router', 'api']);
app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/');

  // Abstract state parent to all other states
  $stateProvider.state('weco', {
    abstract: true,
    resolve: {
      authenticate: function() {
        // TODO
        console.log("This code is ran before any state is reached...");
      }
    },
    template: '<div class="full-page" ui-view></div>'
  })
  // Homepage state
  .state('weco.home', {
    url: '/',
    templateUrl: '/app/home/home.view.html'
  })
  // Log In/Sign Up state
  .state('weco.auth', {
    abstract: true,
    templateUrl: '/app/auth/auth.view.html'
  })
  .state('weco.auth.login', {
    url: '/login'
  })
  .state('weco.auth.signup', {
    url: '/signup'
  });
});

'use strict';

var app = angular.module('wecoApp');
app.controller('authController', ['$scope', '$state', 'User', function($scope, $state, User) {
  $scope.credentials = {};
  $scope.user = User.data;

  $scope.isLoginForm = function() {
    return $state.current.name == 'weco.auth.login';
  };

  function login() {
    User.login($scope.credentials).then(function() {
      // successful login; redirect to home page
      $state.go('weco.home');
    }, function() {
      // TODO: pretty error
      alert('Unable to log in!');
    });
  }

  function signup() {
    /*User.login($scope.credentials).then(function() {
      // successful login; redirect to home page
      $state.go('weco.home');
    }, function() {
      // TODO: pretty error
      alert('Unable to log in!');
    });*/
    console.log("sign up");
  }

  $scope.submit = function() {
    if($scope.isLoginForm()) {
      login();
    } else {
      signup();
    }
  };
}]);

"use strict";

 angular.module('config', [])

.constant('ENV', {name:'development',apiEndpoint:'http://api-dev.eu9ntpt33z.eu-west-1.elasticbeanstalk.com/'})

;
var app = angular.module('wecoApp');
app.directive('navBar', ['User', '$state', function(User, $state) {
  return {
    restrict: 'E',
    replace: 'true',
    templateUrl: '/app/nav/nav.view.html',
    link: function($scope, element, attrs) {
      $scope.user = User.data;
      $scope.isLoggedIn = User.isLoggedIn;
      $scope.logout = function() {
        User.logout().then(function() {
          // successful logout; go to login page
          $state.go('weco.auth.login');
        }, function() {
          // TODO: pretty error
          alert('Unable to log out!');
        });
      };
    }
  };
}]);

var api = angular.module('api', ['ngResource']);
api.config(['$httpProvider', function($httpProvider) {
  // must set withCredentials to keep cookies when making API requests
  $httpProvider.defaults.withCredentials = true;
}]);

'use strict';

var api = angular.module('api');
api.factory('UserAPI', ['$resource', 'ENV', function($resource, ENV) {

  var User = $resource(ENV.apiEndpoint + 'user/:id',
    {
      id: 'me'
    },
    {
      login: {
        method: 'POST',
        params: {
          id: 'login'
        },
        // indicate that the data is x-www-form-urlencoded
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        // transform the request to use x-www-form-urlencoded
        transformRequest: function(data, headersGetter) {
          var str = [];
          for (var d in data)
            str.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
          return str.join("&");
        }
      },
      logout: {
        method: 'GET',
        params: {
          id: 'logout'
        }
      }
    });

   return User;
}]);

'use strict';

var app = angular.module('wecoApp');
app.factory('User', ['UserAPI', function(UserAPI) {
  var User = {};
  var data = {};

  data = UserAPI.get(); // initial fetch
  User.data = function() {
    return data.data || {};
  };

  // if the user data has a username attribute, we're logged in
  User.isLoggedIn = function() {
    return User.data().username || false;
  };

  User.login = function(credentials) {
    return new Promise(function(resolve, reject) {
      UserAPI.login(credentials).$promise.catch(function(response) {
        reject(response.status);
      }).then(function() {
        data = UserAPI.get(function() {
          resolve();
        });
      });
    });
  };

  User.logout = function() {
    return new Promise(function(resolve, reject) {
      UserAPI.logout().$promise.catch(function(response) {
        reject(response.status);
      }).then(function() {
        data = UserAPI.get();
        resolve();
      });
    });
  };

  return User;
}]);
