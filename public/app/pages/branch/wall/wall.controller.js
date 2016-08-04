'use strict';

var app = angular.module('wecoApp');
app.controller('wallController', ['$scope', '$state', '$timeout', 'Branch', function($scope, $state, $timeout, Branch) {
  $scope.isLoading = true;
  $scope.posts = [];

  // watch for change in drop down menu time filter selection
  $scope.selectedTimeItemIdx = 0;
  $scope.$watch('selectedTimeItemIdx', function () {
    
  });
}]);
