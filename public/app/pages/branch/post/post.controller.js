'use strict';

var app = angular.module('wecoApp');
app.controller('postController', ['$scope', '$state', '$timeout', 'Post', function($scope, $state, $timeout, Post) {
  $scope.isLoading = true;
  $scope.post = {};
  $scope.markdownRaw = '';
  $scope.videoEmbedURL = '';

  function isYouTubeUrl(url) {
    if(url && url !== '') {
      var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
      var match = url.match(regExp);
      if(match && match[2].length == 11) {
        return true;
      }
    }
    return false;
  }

  Post.get($state.params.postid).then(function(post) {
    $timeout(function () {
      $scope.post = post;
      $scope.markdownRaw = post.text;
      $scope.isLoading = false;

      // get the video embed url if this is a video post
      if($scope.post.type == 'video' && isYouTubeUrl($scope.post.text)) {
        var video_id = $scope.post.text.split('v=')[1] || $scope.post.text.split('embed/')[1];
        if(video_id.indexOf('&') != -1) {
          video_id = video_id.substring(0, video_id.indexOf('&'));
        }
        $scope.videoEmbedURL = '//www.youtube.com/embed/' + video_id + '?rel=0';
      }
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
