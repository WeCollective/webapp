var app = angular.module('wecoApp');
app.controller('nucleusFlaggedPostsController', ['$scope', '$state', '$timeout', 'Branch', 'Post', 'Alerts', function($scope, $state, $timeout, Branch, Post, Alerts) {
  $scope.isLoading = false;
  $scope.posts = [];

  $scope.postTypeItems = ['ALL', 'TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'PAGE'];
  $scope.selectedPostTypeItemIdx = 0;

  $scope.sortByItems = ['DATE', 'BRANCH RULES FLAGS', 'SITE RULES FLAGS', 'WRONG TYPE FLAGS'];
  $scope.selectedSortByItemIdx = 0;
  $scope.$watch('selectedSortByItemIdx', function () {
    getPosts();
  });

  // Time filter dropdown configuration
  $scope.timeItems = ['ALL TIME', 'THIS YEAR', 'THIS MONTH', 'THIS WEEK', 'LAST 24 HRS', 'THIS HOUR'];
  $scope.selectedTimeItemIdx = 0;
  $scope.$watch('selectedTimeItemIdx', function () {
    getPosts();
  });

  $scope.getTimeafter = function(timeItem) {
    // compute the appropriate timeafter for the selected time filter
    var timeafter;
    var date = new Date();
    switch(timeItem) {
      case 'ALL TIME':
        timeafter = 0;
        break;
      case 'THIS YEAR':
        timeafter = new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0).getTime();
        break;
      case 'THIS MONTH':
        timeafter = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0).getTime();
        break;
      case 'THIS WEEK':
        timeafter = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 1, 0, 0, 0, 0).getTime();
        break;
      case 'LAST 24 HRS':
        var yesterday = new Date(date);
        yesterday.setDate(date.getDate() - 1);
        timeafter = new Date(date.getFullYear(), date.getMonth(), yesterday.getDate(), date.getHours(), 0, 0, 0).getTime();
        break;
      case 'THIS HOUR':
        timeafter = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), 0, 0, 0).getTime();
        break;
      default:
    }
    return timeafter;
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
    var sortBy;
    switch($scope.sortByItems[$scope.selectedSortByItemIdx]) {
      case 'DATE':
        sortBy = 'date';
        break;
      case 'BRANCH RULES FLAGS':
        sortBy = 'branch_rules';
        break;
      case 'SITE RULES FLAGS':
        sortBy = 'site_rules';
        break;
      case 'WRONG TYPE FLAGS':
        sortBy = 'wrong_type';
        break;
      default:
        sortBy = 'date';
        break;
    }

    // fetch the posts for this branch and timefilter
    Branch.getFlaggedPosts($scope.branchid, timeafter, sortBy).then(function(posts) {
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
}]);
