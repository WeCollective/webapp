var app = angular.module('wecoApp');
app.directive('writeComment', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      parentid: '&',
      postid: '&',
      onSubmit: '=',
      onCancel: '=',
      update: '=',
      placeholder: '&',
      originalCommentText: '&'
    },
    templateUrl: '/app/components/write-comment/write-comment.view.html',
    controller: 'writeCommentController'
  };
});
