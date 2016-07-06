'use strict';

var app = angular.module('wecoApp');
app.controller('branchController', ['$scope', '$state', 'Branch', function($scope, $state, Branch) {
  $scope.branchid = $state.params.branchid;

  // return true if the given branch control is selected,
  // i.e. if the current state contains the control name
  $scope.isControlSelected = function(control) {
    return $state.current.name.indexOf(control) > -1;
  };

  $scope.branch = {};
  Branch.get($state.params.branchid).then(function(branch) {
    $scope.branch = branch;
  }, function() {
    // TODO: pretty error
    console.error("Unable to get branch");
  });
}]);
