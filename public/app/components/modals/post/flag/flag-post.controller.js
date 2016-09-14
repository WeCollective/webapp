var app = angular.module('wecoApp');
app.controller('modalFlagPostController', ['$scope', '$timeout', 'Modal', function($scope, $timeout, Modal) {
  $scope.errorMessage = '';
  $scope.isLoading = false;
  $scope.branchid = Modal.getInputArgs().branchid;

  $scope.flagItems = ['AGAINST THE BRANCH RULES', 'AGAINST SITE RULES', 'NOT A ' + Modal.getInputArgs().postType.toUpperCase() + ' POST'];
  $scope.selectedFlagItemIdx = 0;

  $scope.$on('OK', function() {

  });

  $scope.$on('Cancel', function() {
    $timeout(function() {
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.Cancel();
    });
  });

  $scope.close = function() {
    $timeout(function() {
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.Cancel();
    });    
  };
}]);
