var app = angular.module('wecoApp');
app.controller('modalDeletePostController', ['$scope', '$timeout', 'Modal', 'Post', 'Alerts', function($scope, $timeout, Modal, Post, Alerts) {
  $scope.Modal = Modal;
  $scope.errorMessage = '';
  $scope.isLoading = false;

  $scope.$on('OK', function() {
    $scope.isLoading = true;
    Post.delete(Modal.getInputArgs().postid).then(function() {
      Alerts.push('success', 'Your post was deleted.');
      $scope.isLoading = false;
      Modal.OK();
    }, function(err) {
      $scope.isLoading = false;
      Alerts.push('error', 'Error deleting your post!');
      Modal.Cancel();
    });
  });

  $scope.$on('Cancel', function() {
    $timeout(function() {
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.Cancel();
    });
  });
}]);
