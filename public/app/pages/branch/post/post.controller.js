'use strict';

var app = angular.module('wecoApp');
app.controller('postController', ['$scope', '$state', '$timeout', 'Post', function($scope, $state, $timeout, Post) {
  $scope.isLoading = true;
  $scope.post = {};
  $scope.markdownRaw = '';

  Post.get($state.params.postid).then(function(post) {
    $timeout(function () {
      $scope.post = post;
      $scope.markdownRaw = post.data.text;
      $scope.isLoading = false;
    });
  }, function(response) {
    // TODO: handle other error codes
    // post not found - 404
    if(response.status == 404) {
      $state.go('weco.notfound');
    }
    $scope.isLoading = false;
  });
}]);
