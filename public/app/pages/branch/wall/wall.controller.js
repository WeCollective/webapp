'use strict';

var app = angular.module('wecoApp');
app.controller('wallController', ['$scope', '$state', '$timeout', 'Branch', 'Post', 'Alerts', 'Modal', 'ENV', function($scope, $state, $timeout, Branch, Post, Alerts, Modal, ENV) {
  $scope.isLoading = false;
  $scope.isLoadingMore = false;
  $scope.posts = [];
  $scope.stat = 'global';

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

  $scope.vote = function(post, direction) {
    Post.vote($scope.branchid, post.id, direction).then(function() {
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

  $scope.setStat = function(stat) {
    $timeout(function () {
      $scope.isLoading = true;
      $scope.stat = stat;
      $scope.posts = [];
      getPosts();
    });
  };

  // return the correct ui-sref string for when the specified post is clicked
  $scope.getLink = function(post) {
    if(post.type == 'text') {
      return $state.href('weco.branch.post', { postid: post.id });
    }
    return post.text;
  };

  function getPosts(lastPostId) {
    // compute the appropriate timeafter for the selected time filter
    var timeafter = $scope.getTimeafter($scope.timeItems[$scope.selectedTimeItemIdx]);
    var sortBy;
    switch($scope.sortByItems[$scope.selectedSortByItemIdx]) {
      case 'TOTAL POINTS':
        sortBy = 'points';
        break;
      case 'DATE':
        sortBy = 'date';
        break;
      case 'NUMBER OF COMMENTS':
        sortBy = 'comment_count';
        break;
      default:
        sortBy = 'points';
        break;
    }
    var postType = $scope.postTypeItems[$scope.selectedPostTypeItemIdx].toLowerCase();

    // fetch the posts for this branch and timefilter
    Branch.getPosts($scope.branchid, timeafter, sortBy, $scope.stat, postType, lastPostId).then(function(posts) {
      $timeout(function() {
        // if lastPostId was specified we are fetching _more_ posts, so append them
        if(lastPostId) {
          $scope.posts = $scope.posts.concat(posts);
        } else {
          $scope.posts = posts;
        }
        $scope.isLoading = false;
        $scope.isLoadingMore = false;
      });
    }, function() {
      Alerts.push('error', 'Error fetching posts.');
      $scope.isLoading = false;
    });
  }

  $scope.loadMore = function() {
    if(!$scope.isLoadingMore) {
      $scope.isLoadingMore = true;
      if($scope.posts.length > 0) getPosts($scope.posts[$scope.posts.length - 1].id);
    }
  };

  $scope.openFlagPostModal = function(post) {
    Modal.open('/app/components/modals/post/flag/flag-post.modal.view.html', { post: post, branchid: $scope.branchid })
      .then(function(result) {
        if(result) {
          Alerts.push('success', 'Post flagged. The branch moderators will be informed.');
        }
      }, function() {
        Alerts.push('error', 'Unable to flag post.');
      });
  };

  // watch for change in drop down menu time filter selection
  $scope.selectedTimeItemIdx = 0;
  $scope.$watch('selectedTimeItemIdx', function () {
    $timeout(function () {
      $scope.isLoading = true;
      $scope.posts = [];
      getPosts();
    });
  });

  $scope.postTypeItems = ['ALL', 'TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'PAGE'];
  $scope.selectedPostTypeItemIdx = 0;

  $scope.$watch('selectedPostTypeItemIdx', function () {
    $timeout(function () {
      $scope.isLoading = true;
      $scope.posts = [];
      getPosts();
    });
  });

  $scope.sortByItems = ['TOTAL POINTS', 'NUMBER OF COMMENTS', 'DATE'];
  $scope.selectedSortByItemIdx = 0;

  $scope.$watch('selectedSortByItemIdx', function () {
    $timeout(function () {
      $scope.isLoading = true;
      $scope.posts = [];
      getPosts();
    });
  });
}]);
