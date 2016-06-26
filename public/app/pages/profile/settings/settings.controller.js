var app = angular.module('wecoApp');
app.controller('profileSettingsController', ['$scope', 'Modal', function($scope, Modal) {
  $scope.openModal = function(args) {
    console.log(args);
    Modal.open('/app/components/modals/profile/settings/settings.modal.view.html', args)
      .then(function(result) {
        console.log(result);
      }, function() {
        console.log('error');
      });
  };
}]);
