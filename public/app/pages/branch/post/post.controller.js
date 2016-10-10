'use strict';

var app = angular.module('wecoApp');
app.controller('postController', ['$scope', '$rootScope', '$state', '$timeout', 'Post', 'Comment', 'Alerts', 'User', 'Modal', 'ENV', function($scope, $rootScope, $state, $timeout, Post, Comment, Alerts, User, Modal, ENV) {
  $scope.isLoadingPost = true;
  $scope.isLoadingComments = true;
  $scope.isLoadingMore = false;
  $scope.post = {};
  $scope.comments = [];
  $scope.markdownRaw = '';
  $scope.videoEmbedURL = '';
  $scope.previewState = 'show'; // other states: 'show', 'maximise'

  $scope.getProxyUrl = function(url) {
    // only proxy http requests, not https
    if(url && url.substring(0, 5) === 'http:') {
      return ENV.apiEndpoint + 'proxy?url=' + url;
    } else {
      return url;
    }
  };

  $scope.getOriginalBranchesTooltipString = function(post) {
    if(!post.data || !post.data.original_branches) return '';
    var tooltip = '';
    var original_branches = JSON.parse(post.data.original_branches);
    for(var i = 1; i < original_branches.length; i++) {
      tooltip += (original_branches[i] + (i < original_branches.length ? '\n' : ''));
    }
    return tooltip;
  };

  $scope.getOriginalBranches = function(post) {
    if(!post.data || !post.data.original_branches) return '';
    return JSON.parse(post.data.original_branches);
  };

  $scope.isOwnPost = function() {
    if(!$scope.post || !$scope.post.data) return false;
    return User.me().username == $scope.post.data.creator;
  };

  $scope.openDeletePostModal = function() {
    Modal.open('/app/components/modals/post/delete/delete-post.modal.view.html', { postid: $scope.post.id })
      .then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go('weco.home');
        }
      }, function() {
        Alerts.push('error', 'Unable to delete post.');
      });
  };

  $scope.sortItems = ['POINTS', 'REPLIES', 'DATE'];

  // watch for change in drop down menu sort by selection
  $scope.selectedSortItemIdx = 0;
  $scope.$watch('selectedSortItemIdx', function () {
    $timeout(function () {
      $scope.isLoadingComments = true;
      $scope.comments = [];
      getComments();
    });
  });

  // when a new comment is posted, reload the comments
  $scope.onSubmitComment = function() {
    $timeout(function () {
      $scope.isLoadingComments = true;
      $scope.comments = [];
      getComments();
    });
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
      Alerts.push('success', 'Thanks for voting!');
    }, function(err) {
      if(err.status === 400) {
        Alerts.push('error', 'You have already voted on this post.');
      } else {
        Alerts.push('error', 'Error voting on post.');
      }
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
      $scope.post = post;
      $scope.markdownRaw = post.data.text;
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
    // post not found - 404
    if(response.status == 404) {
      $state.go('weco.notfound');
    } else {
      Alerts.push('error', 'Error fetching post.');
    }
    $scope.isLoadingPost = false;
  });

  function getComments(lastCommentId) {
    if($scope.isCommentPermalink()) {
      // fetch the permalinked comment
      Comment.get($state.params.postid, $state.params.commentid).then(function(comment) {
        $timeout(function() {
          $scope.comments = [comment];
          $scope.isLoadingComments = false;
        });
      }, function(err) {
        if(err.status != 404) {
          Alerts.push('error', 'Error loading comments.');
        }
        $scope.isLoadingComments = false;
      });
    } else {
      // fetch all the comments for this post
      var sortBy = $scope.sortItems[$scope.selectedSortItemIdx].toLowerCase();
      Comment.getMany($state.params.postid, undefined, sortBy, lastCommentId).then(function(comments) {
        $timeout(function() {
          // if lastCommentId was specified we are fetching _more_ comments, so append them
          if(lastCommentId) {
            $scope.comments = $scope.comments.concat(comments);
          } else {
            $scope.comments = comments;
          }
          $scope.isLoadingMore = false;
          $scope.isLoadingComments = false;
        });
      }, function(err) {
        if(err.status != 404) {
          Alerts.push('error', 'Error loading comments.');
        }
        $scope.isLoadingComments = false;
      });
    }
  }

  $scope.loadMore = function() {
    if(!$scope.isLoadingMore) {
      $scope.isLoadingMore = true;
      if($scope.comments.length > 0) getComments($scope.comments[$scope.comments.length - 1].id);
    }
  };

  // reload the comments on any state change
  // (when first navigated to AND when going to/from comment permalink state)
  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams, options) {
    $timeout(function () {
      $scope.isLoadingComments = true;
      $scope.comments = [];
      getComments();
    });
  });
}]);
