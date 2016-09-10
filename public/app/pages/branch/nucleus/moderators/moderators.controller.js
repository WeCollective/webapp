'use strict';

var app = angular.module('wecoApp');
app.controller('nucleusModeratorsController', ['$scope', '$state', '$timeout', 'User', 'Branch', 'Alerts', function($scope, $state, $timeout, User, Branch, Alerts) {
  $scope.mods = [];
  $scope.isLoading = true;

  $scope.getMod = function(username, index) {
    var p = User.get(username);
    p.then(function(data) {
      $timeout(function() {
        $scope.mods[index] = data;
      });
    }, function () {
      Alerts.push('error', 'Error fetching moderator.');
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
    Alerts.push('error', 'Error fetching moderators.');
    $scope.isLoading = false;
  });
}]);
