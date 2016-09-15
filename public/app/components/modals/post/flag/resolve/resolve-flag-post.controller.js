var app = angular.module('wecoApp');
app.controller('modalResolveFlagPostController', ['$scope', '$timeout', 'Modal', 'Post', 'Alerts', function($scope, $timeout, Modal, Post, Alerts) {
  $scope.errorMessage = '';
  $scope.isLoading = false;
  $scope.post = Modal.getInputArgs().post;
  $scope.data = {
    reason: ''
  };

  $scope.postTypeItems = ['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'PAGE'];
  $scope.selectedPostTypeItemIdx = 0;

  $scope.resolveItems = ['CHANGE POST TYPE', 'REMOVE POST', 'APPROVE POST'];
  $scope.selectedResolveItemIdx = 0;

  $scope.reasonItems = ['VIOLATING BRANCH RULES', 'VIOLATING SITE RULES'];
  $scope.selectedReasonItemIdx = 0;

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
