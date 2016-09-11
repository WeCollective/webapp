'use strict';

var app = angular.module('wecoApp');
app.controller('authController', ['$scope', '$state', 'User', 'Alerts', function($scope, $state, User, Alerts) {
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
      Alerts.push('success', 'Check your inbox to verify your account!', true);
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
