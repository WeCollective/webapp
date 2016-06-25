'use strict';

var app = angular.module('wecoApp');
app.controller('authController', ['$scope', '$state', 'User', function($scope, $state, User) {
  $scope.credentials = {};
  $scope.user = User.me;

  $scope.isLoginForm = function() {
    return $state.current.name == 'auth.login';
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
    User.signup($scope.credentials).then(function() {
      // successful signup; redirect to home page
      $state.go('weco.home');
    }, function() {
      // TODO: pretty error
      alert('Unable to sign up!');
    });
  }

  $scope.submit = function() {
    if($scope.isLoginForm()) {
      login();
    } else {
      signup();
    }
  };
}]);
