var app = angular.module('wecoApp');
app.controller('nucleusModToolsController', ['$scope', '$state', '$timeout', 'Modal', 'User', 'Branch', 'Alerts', function($scope, $state, $timeout, Modal, User, Branch, Alerts) {
  $scope.isLoading = true;
  $scope.isModLogOpen = false;

  $scope.toggleIsModLogOpen = function () {
    $scope.isModLogOpen = !$scope.isModLogOpen;
  };

  $scope.modLog = [];
  Branch.getModLog($scope.branchid).then(function(log) {
    $timeout(function () {
      $scope.modLog = log;
      $scope.isLoading = false;
    });
  }, function() {
    Alerts.push('error', 'Error fetching moderator action log.');
    $scope.isLoading = false;
  });

  $scope.openAddModModal = function() {
    Modal.open('/app/components/modals/branch/nucleus/modtools/add-mod/add-mod.modal.view.html', { branchid: $scope.branchid })
      .then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        Alerts.push('error', 'Error updating moderator settings.');
      });
  };

  $scope.openRemoveModModal = function() {
    var me;
    /* jshint shadow:true */
    for(var i = 0; i < $scope.branch.mods.length; i++) {
      if($scope.branch.mods[i].username == User.me().username) {
        me = $scope.branch.mods[i];
      }
    }

    // a list of mods to be removed; not self, and must be added after self
    var removableMods = [];
    for(var i = 0; i < $scope.branch.mods.length; i++) {
      if($scope.branch.mods[i].date > me.date && $scope.branch.mods[i].username !== me.username) {
        removableMods.push($scope.branch.mods[i]);
      }
    }

    Modal.open('/app/components/modals/branch/nucleus/modtools/remove-mod/remove-mod.modal.view.html',
      {
        branchid: $scope.branchid,
        mods: removableMods
      }).then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        Alerts.push('error', 'Error updating moderator settings.');
      });
  };

  $scope.openSubmitSubbranchRequestModal = function() {
    Modal.open('/app/components/modals/branch/nucleus/modtools/submit-subbranch-request/submit-subbranch-request.modal.view.html',
      {
        branchid: $scope.branchid
      }).then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        Alerts.push('error', 'Error submitting child branch request.');
      });
  };

  $scope.openReviewSubbranchRequestsModal = function() {
    Modal.open('/app/components/modals/branch/nucleus/modtools/review-subbranch-requests/review-subbranch-requests.modal.view.html',
      {
        branchid: $scope.branchid
      }).then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        Alerts.push('error', 'Error responding to child branch request.');
      });
  };

  $scope.openDeleteBranchModal = function() {
    Modal.open('/app/components/modals/branch/nucleus/modtools/delete-branch/delete-branch.modal.view.html', {})
      .then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        Alerts.push('error', 'Error deleting branch.');
      });
  };
}]);
