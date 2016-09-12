var app = angular.module('wecoApp');
app.controller('resetPasswordController', ['$scope', '$state', '$timeout', 'User', 'Alerts', function($scope, $state, $timeout, User, Alerts) {
  $scope.errorMessage = '';
  $scope.isLoading = false;
  $scope.credentials = {};
}]);
