var app = angular.module('wecoApp');
app.controller('modalCreateBranchController', ['$scope', '$timeout', 'Modal', 'Branch', function($scope, $timeout, Modal, Branch) {
  $scope.newBranch = {};
  $scope.errorMessage = '';

  $scope.$on('OK', function() {
    // if not all fields are filled, display message
    if(!$scope.newBranch || !$scope.newBranch.id || !$scope.newBranch.name) {
      $timeout(function() {
        $scope.errorMessage = 'Please fill in all fields';
      });
      return;
    }

    // perform the update
    $scope.isLoading = true;
    $scope.newBranch.id = $scope.newBranch.id.toLowerCase();
    Branch.create($scope.newBranch).then(function() {
      $timeout(function() {
        $scope.newBranch = {};
        $scope.errorMessage = '';
        $scope.isLoading = false;
        Modal.OK();
      });
    }, function(response) {
      $timeout(function() {
        $scope.errorMessage = response.message;
        $scope.isLoading = false;
      });
    });
  });

  $scope.$on('Cancel', function() {
    $timeout(function() {
      $scope.newBranch = {};
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.Cancel();
    });
  });
}]);
