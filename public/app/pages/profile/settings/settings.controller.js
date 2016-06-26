var app = angular.module('wecoApp');
app.controller('profileSettingsController', ['$scope', 'Modal', function($scope, Modal) {
  $scope.test = 'TEST';
  $scope.openModal = function() {
    Modal.open('/app/components/modals/profile/settings/settings.modal.view.html').then(function(result) {
      console.log(result);
    }, function() {
      console.log('error');
    });
  };
}]);
