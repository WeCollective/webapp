'use strict';

var app = angular.module('wecoApp');
app.controller('loginController', ['$scope', '$state', 'User', function($scope, $state, User) {
  $scope.credentials = {};
  $scope.user = User.data;

  $scope.login = function() {
    User.login($scope.credentials).then(function() {
      // successful login; redirect to home page
      $state.go('weco.home');
    }, function() {
      // TODO: pretty error
      alert('Unable to log in!');
    });
  };
}]);
