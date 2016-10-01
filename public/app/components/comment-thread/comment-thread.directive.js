var app = angular.module('wecoApp');
app.directive('commentThread', ['$state', 'Comment', 'User', '$timeout', 'Alerts', function($state, Comment, User, $timeout, Alerts) {
  return {
    restrict: 'E',
    replace: false,
    scope: {
      comments: '=',
      sortBy: '='
    },
    templateUrl: '/app/components/comment-thread/comment-thread.view.html',
    link: function ($scope) {
      $scope.user = User.me();

      $scope.openComment = undefined; // the comment which is being replied to
      $scope.openReply = function(comment, isEdit) {
        $timeout(function () {
          if($scope.openComment) {
            $scope.openComment.openReply = false;
          }
          $scope.openComment = comment;
          $scope.openComment.openReply = true;
          $scope.openComment.update = isEdit;
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
        if($scope.openComment.update) { // if the comment was edited
          $timeout(function () {
            $scope.openComment.isLoading = true;
          });

          // reload the comment data
          Comment.get($scope.openComment.postid, $scope.openComment.id).then(function(response) {
            $timeout(function() {
              $scope.openComment.data = response;
              $scope.openComment.isLoading = false;
              $scope.closeReply();
            });
          }, function () {
            Alerts.push('error', 'Unable to reload comment!');
            $scope.closeReply();
          });
        } else {  // if the comment was replied to
          // load the replies
          $scope.loadMore($scope.openComment);
          $scope.closeReply();
        }
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

      function getReplies(comment, lastCommentId) {
        // fetch the replies to this comment, or just the number of replies
        Comment.getMany(comment.postid, comment.id, $scope.sortBy.toLowerCase(), lastCommentId).then(function(comments) {
          $timeout(function() {
            // if lastCommentId was specified we are fetching _more_ comments, so append them
            if(lastCommentId) {
              comment.comments = comment.comments.concat(comments);
            } else {
              comment.comments = comments;
            }
          });
        }, function() {
          Alerts.push('error', 'Unable to get replies!');
        });
      }

      $scope.loadMore = function(comment) {
        var lastCommentId = null;
        if(comment.comments && comment.comments.length > 0) lastCommentId = comment.comments[comment.comments.length - 1].id;
        getReplies(comment, lastCommentId);
      };

      $scope.vote = function(comment, direction) {
        Comment.vote(comment.postid, comment.id, direction).then(function() {
          var inc = (direction == 'up') ? 1 : -1;
          $timeout(function() {
            comment.individual += inc;
          });
          Alerts.push('success', 'Thanks for voting!');
        }, function(err) {
          if(err.status === 400) {
            Alerts.push('error', 'You have already voted on this comment.');
          } else {
            Alerts.push('error', 'Error voting on comment.');
          }
        });
      };

      $scope.isOwnComment = function(comment) {
        if(!User.me() || !comment.data) {
          return false;
        }
        return User.me().username == comment.data.creator;
      };

      $scope.openCommentPermalink = function(comment) {
        $state.go('weco.branch.post.comment', { postid: comment.postid, commentid: comment.id }, { reload: true });
      };
    }
  };
}]);
