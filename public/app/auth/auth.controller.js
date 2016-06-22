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
