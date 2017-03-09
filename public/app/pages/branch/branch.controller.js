'use strict';

var app = angular.module('wecoApp');
app.controller('branchController', ['$scope', '$rootScope', '$state', '$timeout', 'Branch', 'Mod', 'User', 'Modal', 'Alerts', function($scope, $rootScope, $state, $timeout, Branch, Mod, User, Modal, Alerts) {
  $scope.branchid = $state.params.branchid;
  $scope.showCover = true;
  $scope.isLoading = true;
  $scope.User = User;

  // Time filter dropdown configuration
  $scope.timeItems = ['ALL TIME', 'PAST YEAR', 'PAST MONTH', 'PAST WEEK', 'PAST 24 HRS', 'PAST HOUR'];
  $scope.getTimeafter = function(timeItem) {
    // compute the appropriate timeafter for the selected time filter
    var timeafter;
    var date = new Date();
    switch(timeItem) {
      case 'ALL TIME':
        timeafter = 0;
        break;
      case 'PAST YEAR':
        timeafter = new Date().setFullYear(new Date().getFullYear() - 1);
        break;
      case 'PAST MONTH':
        timeafter = new Date().setMonth(new Date().getMonth() - 1);
        break;
      case 'PAST WEEK':
        timeafter = new Date().setDate(new Date().getDate() - 7);
        break;
      case 'PAST 24 HRS':
        timeafter = new Date().setDate(new Date().getDate() - 1);
        break;
      case 'PAST HOUR':
        timeafter = new Date().setHours(new Date().getHours() - 1);
        break;
      default:
        timeafter = 0;
        break;
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
    $timeout(function () {
      $scope.isLoading = false;
    });
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
        createPost();
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

  // dynamic tooltip text for add content button, whose behaviour
  // is dependent on the current state
  $scope.getAddContentTooltip = function() {
    switch ($state.current.name) {
      case 'weco.branch.subbranches':
        return 'Create New Branch';
      case 'weco.branch.wall':
        return 'Add New Post';
      case 'weco.branch.post':
        return 'Write a Comment';
      default:
        return '';
    }
  };

  // returns boolean indicating whether the add content behaviour has any defined
  // behaviour in the current state
  $scope.canAddContent = function() {
    switch ($state.current.name) {
      case 'weco.branch.subbranches':
      case 'weco.branch.wall':
      case 'weco.branch.post':
        return true;
      default:
        return false;
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


  $scope.followedBranches = [];
  $scope.$watch(function() {
    return User.me().username;
  }, function () {
    if(User.me().username) {
      User.getFollowedBranches(User.me().username).then(function(branches) {
        $scope.followedBranches = branches;
      }, function(err) {
        $scope.followedBranches = [];
      });
    }
  });

  $scope.isFollowingBranch = function() {
    return $scope.followedBranches.indexOf($scope.branch.id) > -1;
  };

  $scope.toggleFollowBranch = function() {
    $scope.isLoading = true;
    var promise, messageSuccess, messageError;
    if($scope.isFollowingBranch()) {
      promise = User.unfollowBranch(User.me().username, $scope.branch.id);
      messageSuccess = 'You\'re no longer following this branch!';
      messageError = 'Error unfollowing branch.';
    } else {
      promise = User.followBranch(User.me().username, $scope.branch.id);
      messageSuccess = 'You\'re now following this branch!';
      messageError = 'Error following branch.';
    }

    promise.then(function() {
      User.getFollowedBranches(User.me().username).then(function(branches) {
        $timeout(function () {
          $scope.followedBranches = branches;
          $scope.isLoading = false;
        });
        Alerts.push('success', messageSuccess);
      }, function(err) {
        $timeout(function () {
          $scope.followedBranches = [];
          $scope.isLoading = false;
        });
        Alerts.push('error', 'Error fetching followed branches.');
      });
    }, function(err) {
      $timeout(function () {
        $scope.isLoading = false;
      });
      Alerts.push('error', messageError);
    });
  };
}]);
