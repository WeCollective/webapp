var app = angular.module('wecoApp');
app.controller('writeCommentController', ['$scope', '$timeout', 'Comment', function($scope, $timeout, Comment) {
  $scope.isLoading = false;
  $scope.comment = {
    text: ''
  };

  $scope.postComment = function() {
    $timeout(function() {
      $scope.isLoading = true;
    });

    $scope.comment.postid = $scope.postid();
    $scope.comment.parentid = $scope.parentid();

    Comment.create($scope.comment).then(function(id) {
      $timeout(function() {
        $scope.isLoading = false;
        $scope.comment = {
          text: ''
        };
        $scope.onSubmit(id);
      });
    }, function(err) {
      // TODO pretty err
      console.log(err);

      $timeout(function() {
        $scope.isLoading = false;
      });
    });
  };

  $scope.cancelComment = function() {
    $timeout(function() {
      $scope.isLoading = false;
      $scope.comment = {
        text: ''
      };
      $scope.onCancel();
    });
  };
}]);
