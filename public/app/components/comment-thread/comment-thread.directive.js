var app = angular.module('wecoApp');
app.directive('commentThread', ['$state', 'Comment', 'User', '$timeout', function($state, Comment, User, $timeout) {
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
            // TODO: pretty error
            console.error("Unable to reload comment!");
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


      // Asynchronously load the comments's data one by one
      // The 'scope' is the bound comment object onto which the data should be attached
      function loadCommentData(scope, comments, idx) {
        var target = comments.shift();
        if(target) {
          Comment.get(scope.postid, scope.comments[idx].id).then(function(response) {
            if(response) {
              $timeout(function() {
                scope.comments[idx].data = response.data;
                scope.comments[idx].isLoading = false;
              });
            }
            // continue
            loadCommentData(scope, comments, idx + 1);
          }).catch(function () {
            // Unable to fetch this comment data - continue
            loadCommentData(scope, comments, idx + 1);
          });
        }
      }

      function getReplies(comment) {
        // fetch the replies to this comment, or just the number of replies
        Comment.getMany(comment.postid, comment.id, $scope.sortBy.toLowerCase()).then(function(response) {
          $timeout(function() {
            comment.comments = response;
            // set all comments to loading until their content is retrieved
            for(var i = 0; i < comment.comments.length; i++) {
              comment.comments[i].isLoading = true;
            }
            // slice() provides a clone of the comments array
            loadCommentData(comment, response.slice(), 0);
          });
        }, function() {
          // TODO: pretty error
          console.error("Unable to get replies!");
        });
      }

      $scope.loadMore = function(comment) {
        getReplies(comment);
      };

      $scope.vote = function(comment, direction) {
        Comment.vote(comment.postid, comment.id, direction).then(function() {
          var inc = (direction == 'up') ? 1 : -1;
          $timeout(function() {
            comment.individual += inc;
          });
        }, function(err) {
          // TODO: pretty error
          console.error("Unable to vote on comment!");
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
