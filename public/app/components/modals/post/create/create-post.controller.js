var app = angular.module('wecoApp');
app.controller('modalCreatePostController', ['$scope', '$timeout', 'Modal', 'Branch', function($scope, $timeout, Modal, Branch) {
  $scope.newPost = {
    branchids: [Modal.getInputArgs().branchid]
  };
  $scope.errorMessage = '';

  $scope.$on('OK', function() {

  });

  $scope.$on('Cancel', function() {
    $timeout(function() {
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.Cancel();
    });
  });
}]);
