var app = angular.module('wecoApp');
app.controller('writeCommentController', ['$scope', '$timeout', 'Comment', 'Alerts', function($scope, $timeout, Comment, Alerts) {
  $scope.isLoading = false;
  $scope.comment = {
    text: ''
  };

  $scope.$watch('update', function () {
    if($scope.update) {
      $scope.comment.text = $scope.originalCommentText();
    } else {
      $scope.comment.text = '';
    }
  });

  $scope.postComment = function() {
    $timeout(function() {
      $scope.isLoading = true;
    });

    $scope.comment.postid = $scope.postid();
    $scope.comment.parentid = $scope.parentid();

    // update an existing comment
    if($scope.update) {
      // NB: if we are editing the existing comment, the supplied "parentid" is
      // actually the id of the comment to be edited
      Comment.update($scope.comment.postid, $scope.comment.parentid, $scope.comment.text).then(function() {
        $timeout(function() {
          $scope.isLoading = false;
          $scope.comment = {
            text: ''
          };
          $scope.onSubmit($scope.comment.id);
        });
      }, function(err) {
        Alerts.push('error', 'Error editing comment.');
        $timeout(function() {
          $scope.isLoading = false;
        });
      });
    } else {
      // create a new comment
      Comment.create($scope.comment).then(function(id) {
        $timeout(function() {
          $scope.isLoading = false;
          $scope.comment = {
            text: ''
          };
          $scope.onSubmit(id);
        });
      }, function(err) {
        Alerts.push('error', 'Error posting comment.');
        $timeout(function() {
          $scope.isLoading = false;
        });
      });
    }
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
