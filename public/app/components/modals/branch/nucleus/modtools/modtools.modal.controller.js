var app = angular.module('wecoApp');
app.controller('modalNucleusModToolsController', ['$scope', '$timeout', 'Modal', 'Branch', function($scope, $timeout, Modal, Branch) {
  $scope.Modal = Modal;
  $scope.errorMessage = '';
  $scope.isLoading = false;
  $scope.data = {};

  $scope.$on('OK', function() {
    var branchid = Modal.getInputArgs().branchid;
    Branch.addMod(branchid, $scope.data.username).then(function() {
      $timeout(function() {
        $scope.data = {};
        $scope.errorMessage = '';
        $scope.isLoading = false;
        Modal.OK();
      });
    }, function(response) {
      $timeout(function() {
        $scope.errorMessage = response.message;
        if(response.status == 404) {
          $scope.errorMessage = 'That user doesn\'t exist';
        }
        $scope.isLoading = false;
      });
    });
  });

  $scope.$on('Cancel', function() {
    $timeout(function() {
      $scope.data = {};
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.Cancel();
    });
  });
}]);
