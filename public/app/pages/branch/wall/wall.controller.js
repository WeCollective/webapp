'use strict';

var app = angular.module('wecoApp');
app.controller('wallController', ['$scope', '$state', '$timeout', 'Branch', 'Post', 'Alerts', 'Modal', function($scope, $state, $timeout, Branch, Post, Alerts, Modal) {
  $scope.isLoading = false;
  $scope.posts = [];
  $scope.stat = 'global';

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
    }, function(err) {
      Alerts.push('error', 'Error voting on post.');
    });
  };

  $scope.setStat = function(stat) {
    $scope.isLoading = true;
    $scope.stat = stat;
    getPosts();
  };

  // return the correct ui-sref string for when the specified post is clicked
  $scope.getLink = function(post) {
    if(post.type == 'text') {
      return $state.href('weco.branch.post', { postid: post.id });
    }
    return post.text;
  };

  // Asynchronously load the post's data one by one
  function loadPostData(posts, idx) {
    var target = posts.shift();
    if(target) {
      Post.get($scope.posts[idx].id).then(function(response) {
        if(response) {
          $timeout(function() {
            var global_stat = $scope.posts[idx].global;
            $scope.posts[idx] = response;
            $scope.posts[idx].global = global_stat;
            $scope.posts[idx].isLoading = false;
          });
        }
        loadPostData(posts, idx + 1);
      }).catch(function () {
        // Unable to fetch this post data - continue
        loadPostData(posts, idx + 1);
      });
    }
  }

  function getPosts() {
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

    // fetch the posts for this branch and timefilter
    Branch.getPosts($scope.branchid, timeafter, sortBy, $scope.stat).then(function(posts) {
      $timeout(function() {
        $scope.posts = posts;
        $scope.isLoading = false;
        // set all posts to loading until their content is retrieved
        for(var i = 0; i < $scope.posts.length; i++) {
          $scope.posts[i].isLoading = true;
        }
        // slice() provides a clone of the posts array
        loadPostData($scope.posts.slice(), 0);
      });
    }, function() {
      Alerts.push('error', 'Error fetching posts.');
      $scope.isLoading = false;
    });
  }

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
    getPosts();
  });

  $scope.postTypeItems = ['ALL', 'TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'PAGE'];
  $scope.selectedPostTypeItemIdx = 0;

  $scope.sortByItems = ['TOTAL POINTS', 'NUMBER OF COMMENTS', 'DATE'];
  $scope.selectedSortByItemIdx = 0;

  $scope.$watch('selectedSortByItemIdx', function () {
    if($scope.sortByItems[$scope.selectedSortByItemIdx] != 'TOTAL POINTS') {
      $scope.setStat('individual');
    }
    getPosts();
  });
}]);
