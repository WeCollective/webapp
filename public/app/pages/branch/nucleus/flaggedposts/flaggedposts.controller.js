var app = angular.module('wecoApp');
app.controller('nucleusFlaggedPostsController', ['$scope', '$state', '$timeout', 'Branch', 'Post', 'Alerts', 'Modal', function($scope, $state, $timeout, Branch, Post, Alerts, Modal) {
  $scope.isLoading = false;
  $scope.isLoadingMore = false;
  $scope.posts = [];

  $scope.postTypeItems = ['ALL', 'TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'PAGE'];
  $scope.selectedPostTypeItemIdx = 0;
  $scope.$watch('selectedPostTypeItemIdx', function () {
    $timeout(function () {
      $scope.isLoading = true;
      $scope.posts = [];
      getPosts();
    });
  });

  $scope.sortByItems = ['DATE', 'AGAINST BRANCH RULES', 'AGAINST SITE RULES', 'WRONG POST TYPE', 'NSFW FLAGS'];
  $scope.selectedSortByItemIdx = 0;
  $scope.$watch('selectedSortByItemIdx', function () {
    $timeout(function () {
      $scope.isLoading = true;
      $scope.posts = [];
      getPosts();
    });
  });

  // Time filter dropdown configuration
  $scope.timeItems = ['ALL TIME', 'THIS YEAR', 'THIS MONTH', 'THIS WEEK', 'LAST 24 HRS', 'THIS HOUR'];
  $scope.selectedTimeItemIdx = 0;
  $scope.$watch('selectedTimeItemIdx', function () {
    $timeout(function () {
      $scope.isLoading = true;
      $scope.posts = [];
      getPosts();
    });
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

  function getPosts(lastPostId) {
    // compute the appropriate timeafter for the selected time filter
    var timeafter = $scope.getTimeafter($scope.timeItems[$scope.selectedTimeItemIdx]);
    var sortBy;
    switch($scope.sortByItems[$scope.selectedSortByItemIdx]) {
      case 'DATE':
        sortBy = 'date';
        break;
      case 'AGAINST BRANCH RULES':
        sortBy = 'branch_rules';
        break;
      case 'AGAINST SITE RULES':
        sortBy = 'site_rules';
        break;
      case 'WRONG POST TYPE':
        sortBy = 'wrong_type';
        break;
      case 'NSFW FLAGS':
        sortBy = 'nsfw';
        break;
      default:
        sortBy = 'date';
        break;
    }
    var postType = $scope.postTypeItems[$scope.selectedPostTypeItemIdx].toLowerCase();
    // fetch the posts for this branch and timefilter
    Branch.getFlaggedPosts($scope.branchid, timeafter, sortBy, null, postType, lastPostId).then(function(posts) {
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

  $scope.openResolveFlagPostModal = function(post) {
    Modal.open('/app/components/modals/post/flag/resolve/resolve-flag-post.modal.view.html', { post: post })
      .then(function(result) {
        if(result) {
          Alerts.push('success', 'Done.');
          $timeout(function () {
            $scope.isLoading = true;
            $scope.posts = [];
            getPosts();
          });
        }
      }, function() {
        Alerts.push('error', 'Error resolving flags on post.');
      });
  };

}]);
