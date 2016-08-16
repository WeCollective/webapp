'use strict';

var app = angular.module('wecoApp');
app.controller('postController', ['$scope', '$state', '$timeout', 'Post', 'Comment', function($scope, $state, $timeout, Post, Comment) {
  $scope.isLoadingPost = true;
  $scope.isLoadingComments = true;
  $scope.post = {};
  $scope.comments = [];
  $scope.markdownRaw = '';
  $scope.videoEmbedURL = '';

  // when a new comment is posted, reload the comments
  $scope.onSubmitComment = function() {
    getComments();
  };

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

  // ensure the post exists on the specified branch
  Post.getPostOnBranch($state.params.postid, $scope.branchid).then(function() {
    return Post.get($state.params.postid);
  }, function() {
    // post does not exist on this branch
    $state.go('weco.notfound');
  }).then(function(post) {
    $timeout(function () {
      $scope.post = post;
      $scope.markdownRaw = post.text;
      $scope.isLoadingPost = false;

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
    $scope.isLoadingPost = false;
  });

  // Asynchronously load the comments's data one by one
  function loadCommentData(comments, idx) {
    var target = comments.shift();
    if(target) {
      Comment.get($state.params.postid, $scope.comments[idx].id).then(function(response) {
        if(response) {
          $timeout(function() {
            $scope.comments[idx].data = response;
            $scope.comments[idx].isLoading = false;
          });
        }
        loadCommentData(comments, idx + 1);
      }).catch(function () {
        // Unable to fetch this comment data - continue
        loadCommentData(comments, idx + 1);
      });
    }
  }

  function getComments() {
    // fetch the comments for this post
    Comment.getMany($state.params.postid).then(function(comments) {
      $timeout(function() {
        $scope.comments = comments;
        $scope.isLoadingComments = false;
        // set all comments to loading until their content is retrieved
        for(var i = 0; i < $scope.comments.length; i++) {
          $scope.comments[i].isLoading = true;
        }
        // slice() provides a clone of the comments array
        loadCommentData($scope.comments.slice(), 0);
      });
    }, function() {
      // TODO: pretty error
      console.error("Unable to get comments!");
      $scope.isLoadingComments = false;
    });
  }

  getComments();
}]);
