var app = angular.module('wecoApp');
app.controller('modalResolveFlagPostController', ['$scope', '$timeout', 'Modal', 'Post', 'Branch', 'Alerts', function($scope, $timeout, Modal, Post, Branch, Alerts) {
  $scope.errorMessage = '';
  $scope.isLoading = false;
  $scope.post = Modal.getInputArgs().post;
  $scope.text = {
    reason: ''
  };

  $scope.postTypeItems = ['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'PAGE'];
  $scope.selectedPostTypeItemIdx = 0;

  $scope.resolveItems = ['CHANGE POST TYPE', 'REMOVE POST', 'MARK AS NSFW', 'APPROVE POST'];
  $scope.selectedResolveItemIdx = 0;

  $scope.reasonItems = ['VIOLATING BRANCH RULES', 'VIOLATING SITE RULES'];
  $scope.selectedReasonItemIdx = 0;

  $scope.$on('OK', function() {
    $scope.isLoading = true;
    var action;
    var data;
    switch($scope.selectedResolveItemIdx) {
      case 0: // change post type
        action = 'change_type';
        data = $scope.postTypeItems[$scope.selectedPostTypeItemIdx].toLowerCase();
        break;
      case 1: // remove post
        action = 'remove';
        if($scope.selectedReasonItemIdx === 0) {
          data = 'branch_rules';
        } else if($scope.selectedReasonItemIdx === 1) {
          data = 'site_rules';
        } else {
          Alerts.push('error', 'Unknown reason.');
          return;
        }
        break;
      case 2: // mark as nsfw
        action = 'mark_nsfw';
        break;
      case 3: // approve post
        action = 'approve';
        break;
      default:
        Alerts.push('error', 'Unknown action.');
        return;
    }

    if(action === 'remove' && (!$scope.text.reason || $scope.text.reason.length === 0)) {
      $timeout(function() {
        $scope.errorMessage = 'Please provide an explanatory message for the OP';
        $scope.isLoading = false;
      });
      return;
    }

    Branch.resolveFlaggedPost($scope.post.branchid, $scope.post.id, action, data, $scope.text.reason).then(function() {
      $timeout(function() {
        $scope.errorMessage = '';
        $scope.isLoading = false;
        Modal.OK();
      });
    }).catch(function(response) {
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
