'use strict';

var app = angular.module('wecoApp');
app.controller('branchController', ['$scope', '$state', '$timeout', 'Branch', 'Modal', 'User', function($scope, $state, $timeout, Branch, Modal, User) {
  $scope.branchid = $state.params.branchid;
  $scope.isLoading = true;

  // return true if the given branch control is selected,
  // i.e. if the current state contains the control name
  $scope.isControlSelected = function(control) {
    return $state.current.name.indexOf(control) > -1;
  };

  $scope.branch = {};
  $scope.parent = {};
  // Get branch
  Branch.get($state.params.branchid).then(function(branch) {
    $timeout(function () {
      // Get branch parent
      if(branch.parentid) {
        Branch.get(branch.parentid).then(function(parent) {
          $timeout(function () {
            $scope.branch = branch;
            $scope.parent = parent;
            $scope.isLoading = false;
          });
        }, function(response) {
          // TODO: handle other error codes
          if(response.status == 404) {
            $state.go('weco.notfound');
          }
          $scope.isLoading = false;
        });
      } else {
        $timeout(function () {
          $scope.branch = branch;
          $scope.isLoading = false;
        });
      }
    });
  }, function(response) {
    // TODO: handle other error codes
    if(response.status == 404) {
      $state.go('weco.notfound');
    }
    $scope.isLoading = false;
  });


  $scope.openProfilePictureModal = function() {
    Modal.open('/app/components/modals/upload/upload-image.modal.view.html', { route: 'branch/' + $scope.branchid + '/', type: 'picture' })
      .then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        // TODO: display pretty message
        console.log('error');
      });
  };

  $scope.openCoverPictureModal = function() {
    Modal.open('/app/components/modals/upload/upload-image.modal.view.html', { route: 'branch/' + $scope.branchid + '/', type: 'cover' })
      .then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        // TODO: display pretty message
        console.log('error');
      });
  };

  function createBranch() {
    Modal.open('/app/components/modals/branch/create/create-branch.modal.view.html', {})
      .then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        // TODO: display pretty message
        console.log('error');
      });
  }

  // Called when the add button in the branch controls is clicked.
  // It's behaviour is dependent on the current state.
  $scope.addContent = function () {
    switch ($state.current.name) {
      case 'weco.branch.subbranches':
        createBranch();
        break;
      default:
        console.error("Unable to add content in state " + $state.current.name);
    }
  };

  // returns a boolean indicating whether the current user
  // is a moderator of the current branch
  $scope.isModerator = function () {
    if(!$scope.branch.mods) {
      return false;
    }
    return $scope.branch.mods.indexOf(User.me().username) > -1;
  };
}]);
