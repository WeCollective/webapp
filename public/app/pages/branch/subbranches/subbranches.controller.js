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
