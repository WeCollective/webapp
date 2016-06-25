'use strict';

var app = angular.module('wecoApp');
app.controller('profileController', ['$scope', '$stateParams', 'User', function($scope, $stateParams, User) {
  $scope.user = {};

  User.get($stateParams.username).then(function(user) {
    $scope.$apply(function() {
      $scope.user = user;
    });
  }, function(code) {
    // TODO: 404 not found page when user not found
    console.log("Unable to get user");
    console.log(code);
  });

  $scope.tabItems = ['about', 'timeline'];
  $scope.tabStates = ['weco.profile.about', 'weco.profile.timeline'];

  // Watch for changes in the auth'd user's username
  // When set, if this is the auth'd user's profile page, add the 'settings' tab
  $scope.$watch(function() {
    return User.me().username;
  }, function(username) {
    if(username == $stateParams.username) {
      if($scope.tabItems.indexOf('settings') == -1 && $scope.tabStates.indexOf('weco.profile.settings') == -1) {
        $scope.tabItems.push('settings');
        $scope.tabStates.push('weco.profile.settings');
      }
    }
  });
}]);
