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
  }, function(code) {
    // TODO: Handle other error codes
    if(code == 404) {
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
