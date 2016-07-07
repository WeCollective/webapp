'use strict';

var app = angular.module('wecoApp');
app.controller('subbranchesController', ['$scope', '$state', '$timeout', 'Branch', function($scope, $state, $timeout, Branch) {
  $scope.tabItems = ['all time', 'this year', 'this month', 'this week', 'today', 'this hour'];
  $scope.tabStates =
    ['weco.branch.subbranches({ "branchid": "' + $scope.branchid + '", "filter": "alltime" })',
     'weco.branch.subbranches({ "branchid": "' + $scope.branchid + '", "filter": "year" })',
     'weco.branch.subbranches({ "branchid": "' + $scope.branchid + '", "filter": "month" })',
     'weco.branch.subbranches({ "branchid": "' + $scope.branchid + '", "filter": "week" })',
     'weco.branch.subbranches({ "branchid": "' + $scope.branchid + '", "filter": "today" })',
     'weco.branch.subbranches({ "branchid": "' + $scope.branchid + '", "filter": "hour" })'];

  $scope.branches = [];

  // Asynchronously load the branch images one by one
  function loadBranchPictures(branches, idx) {
    var target = branches.shift();
    if(target) {
      Branch.getPictureUrl($scope.branches[idx].id, 'picture').then(function(response) {
        if(response && response.data && response.data.data) {
          $scope.branches[idx].profileUrl = response.data.data;
        }
        loadBranchPictures(branches, idx + 1);
      }, function () {
        // Unable to fetch this picture - continue
        loadBranchPictures(branches, idx + 1);
      });
    }
  }

  Branch.getSubbranches($scope.branchid).then(function(branches) {
    $timeout(function() {
      $scope.branches = branches;
      // slice() provides a clone of the branches array
      loadBranchPictures($scope.branches.slice(), 0);
    });
  }, function() {
    // TODO: pretty error
    console.error("Unable to get branches!");
  });
}]);
