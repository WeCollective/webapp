'use strict';

var app = angular.module('wecoApp');
app.controller('nucleusModeratorsController', ['$scope', '$state', '$timeout', 'User', 'Branch', function($scope, $state, $timeout, User, Branch) {
  $scope.mods = [];
  $scope.isLoading = true;

  $scope.getMod = function(username, index) {
    var p = User.get(username);
    p.then(function(data) {
      $timeout(function() {
        $scope.mods[index] = data;
      });
    }, function () {
      // TODO: pretty error
      console.error("Unable to get mod!");
    });
    return p;
  };

  var promises = [];
  for(var i = 0; i < $scope.branch.mods.length; i++) {
    promises.push($scope.getMod($scope.branch.mods[i].username, i));
  }
  // when all mods fetched, loading finished
  Promise.all(promises).then(function () {
    $scope.isLoading = false;
  }, function() {
    // TODO: pretty error
    console.error("Unable to fetch mods!");
    $scope.isLoading = false;
  });
}]);
