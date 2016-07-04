'use strict';

var app = angular.module('wecoApp');
app.controller('branchController', ['$scope', '$state', function($scope, $state) {
  $scope.branchname = $state.params.branchname;
  $scope.isControlSelected = function(control) {
    return $state.current.name.indexOf(control) > -1;
  };
}]);
