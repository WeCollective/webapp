var app = angular.module('wecoApp');
app.controller('nucleusModToolsController', ['$scope', '$state', 'Modal', function($scope, $state, Modal) {

  $scope.openAddModModal = function() {
    Modal.open('/app/components/modals/branch/nucleus/modtools/add-mod.modal.view.html', { branchid: $scope.branchid })
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
}]);
