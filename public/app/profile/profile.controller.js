'use strict';

var app = angular.module('wecoApp');
app.controller('profileController', ['$scope', '$stateParams', 'User', function($scope, $stateParams, User) {
  $scope.user = {};

  User.get($stateParams.username).then(function(user) {
    $scope.$apply(function() {
      $scope.user = user;
    });
  }, function(code) {
    // TODO: test this and handle properly
    console.log("Unable to get user");
    console.log(code);
  });

  $scope.tabItems = ['about', 'timeline'];
  $scope.tabStates = ['weco.profile.about', 'weco.profile.timeline'];
}]);
