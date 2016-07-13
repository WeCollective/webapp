var app = angular.module('wecoApp');
app.controller('nucleusModToolsController', ['$scope', '$state', '$timeout', 'Modal', 'User', 'Branch', function($scope, $state, $timeout, Modal, User, Branch) {
  $scope.modLog = [];
  Branch.getModLog($scope.branchid).then(function(log) {
    $timeout(function () {
      $scope.modLog = log;
    });
  }, function() {
    // TODO: pretty error
    console.error("Unable to fetch mod log.");
  });

  $scope.getModLogEntryHTML = function(entry) {
    // TODO: CREATE HTML FROM LOG ENTRY DATA
    var html = '';
  };

  $scope.openAddModModal = function() {
    Modal.open('/app/components/modals/branch/nucleus/modtools/add-mod/add-mod.modal.view.html', { branchid: $scope.branchid })
      .then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        // TODO: display pretty message
        console.error('Error updating moderator settings');
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

    var removableMods = []; // a list of mods to be removed
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
        // TODO: display pretty message
        console.error('Error updating moderator settings');
      });
  };
}]);
