'use strict';

var app = angular.module('wecoApp');
app.controller('wallController', ['$scope', '$state', '$timeout', 'Branch', 'Post', function($scope, $state, $timeout, Branch, Post) {
  $scope.isLoading = false;
  $scope.posts = [];

  // Asynchronously load the post's data one by one
  // TODO: load post pics here in the promise chain too
  function loadPostData(posts, idx) {
    var target = posts.shift();
    if(target) {
      Post.get($scope.posts[idx].id).then(function(response) {
        if(response) {
          $timeout(function() {
            $scope.posts[idx].text = response.text;
            $scope.posts[idx].title = response.title;
            $scope.posts[idx].date = response.date;
            $scope.posts[idx].creator = response.creator;
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
    // fetch the posts for this branch and timefilter
    Branch.getPosts($scope.branchid).then(function(posts) {
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
}]);
