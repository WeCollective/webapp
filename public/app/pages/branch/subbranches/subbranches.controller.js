'use strict';

var app = angular.module('wecoApp');
app.controller('subbranchesController', ['$scope', '$state', '$timeout', 'Branch', 'Alerts', function($scope, $state, $timeout, Branch, Alerts) {
  $scope.isLoading = true;
  $scope.isLoadingMore = false;
  $scope.branches = [];

  function getSubbranches(lastBranchId) {
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
    Branch.getSubbranches($scope.branchid, timeafter, sortBy, lastBranchId).then(function(branches) {
      $timeout(function() {
        // if lastBranchId was specified we are fetching _more_ branches, so append them
        if(lastBranchId) {
          $scope.branches = $scope.branches.concat(branches);
        } else {
          $scope.branches = branches;
        }
        $scope.isLoading = false;
        $scope.isLoadingMore = false;
      });
    }, function() {
      Alerts.push('error', 'Error fetching branches.');
      $scope.isLoading = false;
    });
  }

  $scope.loadMore = function() {
    if(!$scope.isLoadingMore) {
      $scope.isLoadingMore = true;
      if($scope.branches.length > 0) getSubbranches($scope.branches[$scope.branches.length - 1].id);
    }
  };

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
