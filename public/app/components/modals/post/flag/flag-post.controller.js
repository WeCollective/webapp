var app = angular.module('wecoApp');
app.controller('modalFlagPostController', ['$scope', '$timeout', 'Modal', 'Post', 'Alerts', function($scope, $timeout, Modal, Post, Alerts) {
  $scope.errorMessage = '';
  $scope.isLoading = false;
  $scope.branchid = Modal.getInputArgs().branchid;

  $scope.flagItems = ['AGAINST THE BRANCH RULES', 'AGAINST SITE RULES', 'NOT A ' + Modal.getInputArgs().post.type.toUpperCase() + ' POST'];
  if(!Modal.getInputArgs().post.nsfw) {
    $scope.flagItems.push('NSFW');
  }
  $scope.selectedFlagItemIdx = 0;

  $scope.$on('OK', function() {
    $scope.isLoading = true;
    var post = Modal.getInputArgs().post;
    var type;
    switch($scope.selectedFlagItemIdx) {
      case 0:
        type = 'branch_rules';
        break;
      case 1:
        type = 'site_rules';
        break;
      case 2:
        type = 'wrong_type';
        break;
      case 3:
        type = 'nsfw';
        break;
      default:
        $scope.errorMessage = 'Unknown flag type.';
        $scope.isLoading = false;
        return;
    }

    Post.flag(post.id, $scope.branchid, type).then(function() {
      $timeout(function() {
        $scope.errorMessage = '';
        $scope.isLoading = false;
        Modal.OK();
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

  $scope.close = function() {
    $timeout(function() {
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.Cancel();
    });
  };
}]);
