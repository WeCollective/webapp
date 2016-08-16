var app = angular.module('wecoApp');
app.directive('commentThread', ['Comment', '$timeout', function(Comment, $timeout) {
  return {
    restrict: 'E',
    replace: false,
    scope: {
      comments: '='
    },
    templateUrl: '/app/components/comment-thread/comment-thread.view.html',
    link: function ($scope) {
      $scope.openComment = undefined; // the comment which is being replied to
      $scope.openReply = function(comment) {
        $timeout(function () {
          if($scope.openComment) {
            $scope.openComment.openReply = false;
          }
          $scope.openComment = comment;
          $scope.openComment.openReply = true;
        });
      };
      $scope.closeReply = function() {
        $timeout(function() {
          $scope.openComment.openReply = false;
          $scope.openComment = undefined;
        });
      };
      $scope.onCancelComment = function() {
        $scope.closeReply();
      };
      $scope.onSubmitComment = function() {
        $scope.loadMore($scope.openComment);
        $scope.closeReply();
      };

      // compute a string indicate time since post
      $scope.timeSince = function(date) {
        var msPerMinute = 60 * 1000;
        var msPerHour = msPerMinute * 60;
        var msPerDay = msPerHour * 24;
        var msPerMonth = msPerDay * 30;
        var msPerYear = msPerDay * 365;

        var elapsed = new Date().getTime() - new Date(date);

        if (elapsed < msPerMinute) {
          return Math.round(elapsed/1000) + ' seconds ago';
        }
        if (elapsed < msPerHour) {
          return Math.round(elapsed/msPerMinute) + ' minutes ago';
        }
        if (elapsed < msPerDay ) {
          return Math.round(elapsed/msPerHour ) + ' hours ago';
        }
        if (elapsed < msPerMonth) {
          return Math.round(elapsed/msPerDay) + ' days ago';
        }
        if (elapsed < msPerYear) {
          return Math.round(elapsed/msPerMonth) + ' months ago';
        }
        return Math.round(elapsed/msPerYear ) + ' years ago';
      };


      // Asynchronously load the comments's data one by one
      // The 'scope' is the bound comment object onto which the data should be attached
      function loadCommentData(scope, comments, idx) {
        var target = comments.shift();
        if(target) {
          Comment.get(scope.postid, scope.comments[idx].id).then(function(response) {
            if(response) {
              $timeout(function() {
                scope.comments[idx].data = response;
                scope.comments[idx].isLoading = false;
              });
            }
            loadCommentData(scope, comments, idx + 1);
          }).catch(function () {
            // Unable to fetch this comment data - continue
            loadCommentData(scope, comments, idx + 1);
          });
        }
      }

      function getReplies(comment) {
        // fetch the replies to this comment
        Comment.getMany(comment.postid, comment.id).then(function(comments) {
          $timeout(function() {
            comment.comments = comments;
            // set all comments to loading until their content is retrieved
            for(var i = 0; i < comment.comments.length; i++) {
              comment.comments[i].isLoading = true;
            }
            // slice() provides a clone of the comments array
            loadCommentData(comment, comments.slice(), 0);
          });
        }, function() {
          // TODO: pretty error
          console.error("Unable to get replies!");
        });
      }

      $scope.loadMore = function(comment) {
        getReplies(comment);
      };
    }
  };
}]);
