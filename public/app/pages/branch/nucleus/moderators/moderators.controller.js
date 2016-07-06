'use strict';

var app = angular.module('wecoApp');
app.controller('nucleusModeratorsController', ['$scope', '$state', '$timeout', 'User', function($scope, $state, $timeout, User) {
  $scope.mods = [];

  $scope.getMod = function(username, index) {
    User.get(username).then(function(data) {
      $timeout(function() {
        $scope.mods[index] = data;
      });
    }, function () {
      // TODO: pretty error
      console.error("Unable to get mod!");
    });
  };

  for(var i = 0; i < $scope.branch.mods.length; i++) {
    $scope.getMod($scope.branch.mods[i], i);
  }
}]);
