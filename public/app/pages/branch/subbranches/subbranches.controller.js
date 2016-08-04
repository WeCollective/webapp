'use strict';

var app = angular.module('wecoApp');
app.controller('subbranchesController', ['$scope', '$state', '$timeout', 'Branch', function($scope, $state, $timeout, Branch) {
  $scope.isLoading = true;
  $scope.branches = [];

  // Asynchronously load the branch images one by one
  function loadBranchPictures(branches, idx) {
    var target = branches.shift();
    if(target) {
      Branch.getPictureUrl($scope.branches[idx].id, 'picture', false).then(function(response) {
        if(response && response.data && response.data.data) {
          $timeout(function() {
            $scope.branches[idx].profileUrl = response.data.data;
          });
        }
        return Branch.getPictureUrl($scope.branches[idx].id, 'picture', true);
      }).then(function(response) {
        if(response && response.data && response.data.data) {
          $timeout(function() {
            $scope.branches[idx].profileUrlThumb = response.data.data;
          });
        }
        loadBranchPictures(branches, idx + 1);
      }).catch(function () {
        // Unable to fetch this picture - continue
        loadBranchPictures(branches, idx + 1);
      });
    }
  }

  function getSubbranches() {
    // compute the appropriate timeafter for the selected time filter
    var timeafter;
    var date = new Date();
    switch($scope.timeItems[$scope.selectedTimeItemIdx]) {
      case 'ALL TIME':
        timeafter = 0;
        break;
      case 'THIS YEAR':
        timeafter = new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0).getTime();
        break;
      case 'THIS MONTH':
        timeafter = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0).getTime();
        break;
      case 'THIS WEEK':
        timeafter = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay(), 0, 0, 0, 0).getTime();
        break;
      case 'LAST 24 HRS':
        var yesterday = new Date(date);
        yesterday.setDate(date.getDate() - 1);
        timeafter = new Date(date.getFullYear(), date.getMonth(), yesterday.getDate(), date.getHours(), 0, 0, 0).getTime();
        break;
      case 'THIS HOUR':
        timeafter = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), 0, 0, 0).getTime();
        break;
      default:
    }

    // fetch the subbranches for this branch and timefilter
    Branch.getSubbranches($scope.branchid, timeafter).then(function(branches) {
      $timeout(function() {
        $scope.branches = branches;
        $scope.isLoading = false;
        // slice() provides a clone of the branches array
        loadBranchPictures($scope.branches.slice(), 0);
      });
    }, function() {
      // TODO: pretty error
      console.error("Unable to get branches!");
      $scope.isLoading = false;
    });
  }

  // watch for change in drop down menu time filter selection
  $scope.selectedTimeItemIdx = 0;
  $scope.$watch('selectedTimeItemIdx', function () {
    getSubbranches();
  });

}]);
