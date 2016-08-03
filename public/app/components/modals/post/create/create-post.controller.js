var app = angular.module('wecoApp');
app.controller('modalCreatePostController', ['$scope', '$timeout', 'Modal', 'Post', function($scope, $timeout, Modal, Post) {
  $scope.newPost = {
    branchids: [Modal.getInputArgs().branchid]
  };
  $scope.errorMessage = '';

  $scope.$on('OK', function() {
    // if not all fields are filled, display message
    if(!$scope.newPost || !$scope.newPost.title || !$scope.newPost.branchids ||
       $scope.newPost.branchids.length === 0 || !$scope.newPost.text) {
      $timeout(function() {
        $scope.errorMessage = 'Please fill in all fields';
      });
      return;
    }

    // perform the update
    $scope.isLoading = true;
    $scope.newPost.type = 'text';
    // create copy of post to not interfere with binding of items on tag-editor
    var post = JSON.parse(JSON.stringify($scope.newPost)); // JSON parsing faciltates shallow copy
    post.branchids = JSON.stringify($scope.newPost.branchids);
    Post.create(post).then(function() {
      $timeout(function() {
        var id = $scope.newPost.branchids[0];
        $scope.newPost = {
          branchids: [Modal.getInputArgs().branchid]
        };
        $scope.errorMessage = '';
        $scope.isLoading = false;
        Modal.OK({
          branchid: id
        });
      });
    }, function(response) {
      $timeout(function() {
        $scope.errorMessage = response.message;
        $scope.isLoading = false;
      });
    });
  });

  $scope.$on('Cancel', function() {
    $timeout(function() {
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.Cancel();
    });
  });
}]);
