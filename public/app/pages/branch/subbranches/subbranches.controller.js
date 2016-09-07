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
    var timeafter = $scope.getTimeafter($scope.timeItems[$scope.selectedTimeItemIdx]);
    var sortBy;
    switch($scope.sortByItems[$scope.selectedSortByItemIdx]) {
      case 'TOTAL POINTS':
        sortBy = 'post_points';
        break;
      case 'DATE':
        sortBy = 'date';
        break;
      case 'NUMBER OF POSTS':
        sortBy = 'post_count';
        break;
      case 'NUMBER OF COMMENTS':
        sortBy = 'post_comments';
        break;
      default:
        sortBy = 'date';
        break;
    }

    // fetch the subbranches for this branch and timefilter
    Branch.getSubbranches($scope.branchid, timeafter, sortBy).then(function(branches) {
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

  $scope.sortByItems = ['TOTAL POINTS', 'NUMBER OF POSTS', 'NUMBER OF COMMENTS', 'DATE'];
  $scope.selectedSortByItemIdx = 0;
  $scope.$watch('selectedSortByItemIdx', function () {
    getSubbranches();
  });

}]);
