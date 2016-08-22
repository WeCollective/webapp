'use strict';

var app = angular.module('wecoApp');
app.controller('wallController', ['$scope', '$state', '$timeout', 'Branch', 'Post', function($scope, $state, $timeout, Branch, Post) {
  $scope.isLoading = false;
  $scope.posts = [];
  $scope.stat = 'global';

  $scope.vote = function(post, direction) {
    Post.vote($scope.branchid, post.id, direction).then(function() {
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
            $scope.posts[idx].data = response.data;
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

    // fetch the posts for this branch and timefilter
    Branch.getPosts($scope.branchid, timeafter, $scope.stat).then(function(posts) {
      $timeout(function() {
        $scope.posts = posts;
        console.log(posts);
        $scope.isLoading = false;
        // set all posts to loading until their content is retrieved
        for(var i = 0; i < $scope.posts.length; i++) {
          $scope.posts[i].isLoading = true;
        }
        // slice() provides a clone of the posts array
        loadPostData($scope.posts.slice(), 0);
      });
    }, function() {
      // TODO: pretty error
      console.error("Unable to get posts!");
      $scope.isLoading = false;
    });
  }

  // watch for change in drop down menu time filter selection
  $scope.selectedTimeItemIdx = 0;
  $scope.$watch('selectedTimeItemIdx', function () {
    getPosts();
  });

  $scope.postTypeItems = ['ALL', 'TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'PAGE'];
  $scope.selectedPostTypeItemIdx = 0;
}]);
