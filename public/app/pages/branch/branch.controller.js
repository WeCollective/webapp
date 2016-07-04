'use strict';

var app = angular.module('wecoApp');
app.controller('branchController', ['$scope', '$state', function($scope, $state) {
  $scope.branchname = $state.params.branchname;

  // return true if the given branch control is selected,
  // i.e. if the current state contains the control name
  $scope.isControlSelected = function(control) {
    return $state.current.name.indexOf(control) > -1;
  };
}]);
