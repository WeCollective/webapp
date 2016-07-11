'use strict';

var app = angular.module('wecoApp');
app.controller('nucleusModeratorsController', ['$scope', '$state', '$timeout', 'User', 'Branch', function($scope, $state, $timeout, User, Branch) {
  $scope.mods = [];
  $scope.isLoading = true;

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

  var promises = [];
  Branch.getMods($scope.branchid).then(function(mods) {
    for(var i = 0; i < mods.length; i++) {
      promises.push($scope.getMod(mods[i].username, i));
    }
    // when all mods fetched, loading finished
    Promise.all(promises).then(function () {
      $scope.isLoading = false;
    });
  }, function() {
    // TODO pretty error
    console.error("Unable to get mods!");
  });
}]);
