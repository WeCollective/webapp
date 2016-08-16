var app = angular.module('wecoApp');
app.directive('commentThread', function() {
  return {
    restrict: 'E',
    replace: false,
    scope: {
      comments: '='
    },
    templateUrl: '/app/components/comment-thread/comment-thread.view.html',
    link: function ($scope) {
      $scope.loadMore = function(comment) {
        // TODO: attach comment replies to comment object as comment.comments
        // make sure attach comment data too.
      };
    }
  };
});
