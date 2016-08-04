var app = angular.module('wecoApp');
app.controller('modalCreatePostController', ['$scope', '$timeout', '$http', 'ENV', 'Upload', 'Modal', 'Post', function($scope, $timeout, $http, ENV, Upload, Modal, Post) {
  $scope.Modal = Modal;
  $scope.errorMessage = '';
  $scope.file = null;
  $scope.uploadUrl = '';
  $scope.isUploading = false;
  $scope.isLoading = false;
  $scope.progress = 0;
  $scope.newPost = {
    branchids: [Modal.getInputArgs().branchid]
  };

  $scope.setFile = function(file) {
    $scope.file = file;
  };

  $scope.upload = function(postid) {
    // get image upload signed url
    $http({
      method: 'GET',
      url: ENV.apiEndpoint + 'post/' + postid + '/picture-upload-url'
    }).then(function(response) {
      if(response && response.data && response.data.data) {
        $scope.uploadUrl = response.data.data;
        // upload the image to s3
        Upload.http({
          url: $scope.uploadUrl,
          method: 'PUT',
          headers: {
            'Content-Type': 'image/*'
          },
          data: $scope.file
        }).then(function(resp) {
          $scope.file = null;
          $scope.isUploading = false;
          $scope.progress = 0;
          Modal.OK();
        }, function(err) {
          // TODO: handle error
          $scope.file = null;
          $scope.isUploading = false;
          $scope.progress = 0;
          console.error("Unable to upload photo!");
        }, function(evt) {
          $scope.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });
      } else {
        // TODO: handle error
        console.log("error");
      }
    }, function () {
      // TODO: handle error
      console.log("error");
    });
  };

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
    // save the post to the db
    Post.create(post).then(function(postid) {
      $timeout(function() {
        $scope.errorMessage = '';
        $scope.isLoading = false;
        $scope.progress = 0;
        if($scope.file) {
          $scope.isUploading = true;
          $scope.upload(postid);
        } else {
          Modal.OK();
        }
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
