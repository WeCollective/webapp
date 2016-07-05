'use strict';

var app = angular.module('wecoApp');
app.controller('subbranchesController', ['$scope', '$state', '$timeout', 'Branch', function($scope, $state, $timeout, Branch) {
  $scope.tabItems = ['all time', 'this year', 'this month', 'this week', 'today', 'this hour'];
  $scope.tabStates =
    ['weco.branch.subbranches({ "branchname": "' + $scope.branchname + '", "filter": "alltime" })',
     'weco.branch.subbranches({ "branchname": "' + $scope.branchname + '", "filter": "year" })',
     'weco.branch.subbranches({ "branchname": "' + $scope.branchname + '", "filter": "month" })',
     'weco.branch.subbranches({ "branchname": "' + $scope.branchname + '", "filter": "week" })',
     'weco.branch.subbranches({ "branchname": "' + $scope.branchname + '", "filter": "today" })',
     'weco.branch.subbranches({ "branchname": "' + $scope.branchname + '", "filter": "hour" })'];

  $scope.branches = [];

  Branch.getRoots().then(function(branches) {
    $timeout(function() {
      $scope.branches = branches;
      console.log($scope.branches);
    });
  }, function() {
    // TODO: pretty error
    console.error("Unable to get branches!");
  });
}]);
