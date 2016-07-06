'use strict';

var app = angular.module('wecoApp');
app.controller('nucleusController', ['$scope', '$state', '$timeout', 'Branch', function($scope, $state, $timeout, Branch) {
  $scope.tabItems = ['about', 'control'];
  $scope.tabStates =
    ['weco.branch.nucleus.about({ "branchname": "' + $scope.branchname + '"})',
     'weco.branch.nucleus.control({ "branchname": "' + $scope.branchname + '"})'];
}]);
