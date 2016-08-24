'use strict';

var app = angular.module('wecoApp');
app.controller('postController', ['$scope', '$rootScope', '$state', '$timeout', 'Post', 'Comment', function($scope, $rootScope, $state, $timeout, Post, Comment) {
  $scope.isLoadingPost = true;
  $scope.isLoadingComments = true;
  $scope.post = {};
  $scope.comments = [];
  $scope.markdownRaw = '';
  $scope.videoEmbedURL = '';
  $scope.previewState = 'show'; // other states: 'show', 'maximise'

  // Time filter dropdown configuration
  $scope.sortItems = ['POINTS', 'REPLIES', 'DATE'];
  $scope.selectedSortItemIdx = 0;

  // watch for change in drop down menu sort by selection
  $scope.selectedSortItemIdx = 0;
  $scope.$watch('selectedSortItemIdx', function () {
    getComments();
  });

  // when a new comment is posted, reload the comments
  $scope.onSubmitComment = function() {
    getComments();
  };

  $scope.isCommentPermalink = function() {
    return $state.current.name == 'weco.branch.post.comment';
  };

  $scope.setPreviewState = function(state) {
    $scope.previewState = state;
  };

  // a vote for the post made on the post page is considered the same as a vote
  // made on the world wall, i.e. counts as a vote on the root branch
  $scope.vote = function(post, direction) {
    Post.vote('root', post.id, direction).then(function() {
      var inc = (direction == 'up') ? 1 : -1;
      $timeout(function() {
        post.individual += inc;
        post.local += inc;
        post.global += inc;
      });
    }, function(err) {
      // TODO: pretty error
      console.error("Unable to vote on post!");
    });
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
      console.log(post);
      $scope.post = post;
      $scope.markdownRaw = post.text;
      $scope.isLoadingPost = false;

      // get the video embed url if this is a video post
      if($scope.post.type == 'video' && isYouTubeUrl($scope.post.data.text)) {
        var video_id = $scope.post.data.text.split('v=')[1] || $scope.post.data.text.split('embed/')[1];
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
            $scope.comments[idx].data = response.data;
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
    if($scope.isCommentPermalink()) {
      // fetch the permalinked comment
      Comment.get($state.params.postid, $state.params.commentid).then(function(comment) {
        $timeout(function() {
          $scope.comments = [comment];
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
    } else {
      // fetch all the comments for this post
      var sortBy = $scope.sortItems[$scope.selectedSortItemIdx].toLowerCase();
      Comment.getMany($state.params.postid, undefined, sortBy).then(function(comments) {
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
  }

  // reload the comments on any state change
  // (when first navigated to AND when going to/from comment permalink state)
  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams, options) {
    getComments();
  });
}]);
