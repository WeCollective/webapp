'use strict';

var app = angular.module('wecoApp');
app.controller('branchController', ['$scope', '$rootScope', '$state', '$timeout', 'Branch', 'Mod', 'User', 'Modal', 'Alerts', function($scope, $rootScope, $state, $timeout, Branch, Mod, User, Modal, Alerts) {
  $scope.branchid = $state.params.branchid;
  $scope.showCover = true;
  $scope.isLoading = true;

  $scope.showCoverPicture = function() { $scope.showCover = true; };
  $scope.hideCoverPicture = function() { $scope.showCover = false; };

  // Time filter dropdown configuration
  $scope.timeItems = ['ALL TIME', 'THIS YEAR', 'THIS MONTH', 'THIS WEEK', 'LAST 24 HRS', 'THIS HOUR'];
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

  // return true if the given branch control is selected,
  // i.e. if the current state contains the control name
  $scope.isControlSelected = function(control) {
    return $state.current.name.indexOf(control) > -1;
  };

  $scope.branch = {};
  $scope.parent = {};
  // fetch branch object
  Branch.get($state.params.branchid).then(function(branch) {
    $timeout(function () {
      $scope.branch = branch;
    });
    // now fetch branch mods
    return Mod.getByBranch($scope.branchid);
  }, function(response) {
    // TODO: handle other error codes
    // branch not found - 404
    if(response.status == 404) {
      $state.go('weco.notfound');
    }
  }).then(function(mods) {
    $timeout(function () {
      $scope.branch.mods = mods;
      $scope.isLoading = false;
    });
    // now fetch branch parent
    return Branch.get($scope.branch.parentid);
  }).then(function(parent) {
    $timeout(function() {
      $scope.parent = parent;
    });
  }, function(response) {
    // No parent exists (in root)
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
        Alerts.push('error', 'Unable to update profile picture.');
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
        Alerts.push('error', 'Unable to update cover picture.');
      });
  };

  function createBranch() {
    Modal.open('/app/components/modals/branch/create/create-branch.modal.view.html', {
        branchid: $scope.branchid
      }).then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          if(Modal.getOutputArgs() && Modal.getOutputArgs().branchid) {
            $state.go('weco.branch.subbranches', { branchid: Modal.getOutputArgs().branchid }, { reload: true });
          } else {
            $state.go($state.current, {}, { reload: true });
          }
        }
      }, function() {
        Alerts.push('error', 'Unable to create new branch.');
      });
  }

  function createPost() {
    Modal.open('/app/components/modals/post/create/create-post.modal.view.html', {
        branchid: $scope.branchid
      }).then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          if(Modal.getOutputArgs() && Modal.getOutputArgs().branchid) {
            $state.go('weco.branch.wall', { branchid: Modal.getOutputArgs().branchid }, { reload: true });
          } else {
            $state.go($state.current, {}, { reload: true });
          }
        }
      }, function() {
        Alerts.push('error', 'Unable to create new post.');
      });
  }

  // Called when the add button in the branch controls is clicked.
  // It's behaviour is dependent on the current state.
  $scope.addContent = function () {
    switch ($state.current.name) {
      case 'weco.branch.subbranches':
        createBranch();
        break;
      case 'weco.branch.wall':
        //if($scope.branchid != 'root') {
          createPost();
        //}
        break;
      case 'weco.branch.post':
        // broadcast add comment clicked so that the comment section is scrolled
        // to the top, where the comment box is visible
        $rootScope.$broadcast('add-comment');
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
    for(var i = 0; i < $scope.branch.mods.length; i++) {
      if($scope.branch.mods[i].username == User.me().username) {
        return true;
      }
    }
    return false;
  };
}]);
