var app = angular.module('wecoApp');
app.directive('writeComment', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      parentid: '&',
      postid: '&',
      onPost: '='
    },
    templateUrl: '/app/components/write-comment/write-comment.view.html',
    controller: 'writeCommentController'
  };
});
