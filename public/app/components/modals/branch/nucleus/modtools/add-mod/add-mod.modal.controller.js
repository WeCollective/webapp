var app = angular.module('wecoApp');
app.controller('modalNucleusAddModController', ['$scope', '$timeout', 'Modal', 'Branch', 'User', 'Mod', function($scope, $timeout, Modal, Branch, User, Mod) {
  $scope.Modal = Modal;
  $scope.errorMessage = '';
  $scope.isLoading = false;
  $scope.data = {};

  $scope.$on('OK', function() {
    $scope.isLoading = true;
    var branchid = Modal.getInputArgs().branchid;
    Mod.create(branchid, $scope.data.username).then(function() {
      $timeout(function() {
        $scope.data = {};
        $scope.errorMessage = '';
        $scope.isLoading = false;
        Modal.OK();
      });
    }, function(response) {
      $timeout(function() {
        $scope.data = {};
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
