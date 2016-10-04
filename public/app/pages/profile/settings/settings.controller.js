var app = angular.module('wecoApp');
app.controller('profileSettingsController', ['$scope', '$state', 'Modal', 'Alerts', 'User', function($scope, $state, Modal, Alerts, User) {
  function openModal(args) {
    Modal.open('/app/components/modals/profile/settings/settings.modal.view.html', args)
      .then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
          Alerts.push('success', 'Successfully updated profile settings!');
        }
      }, function() {
        Alerts.push('error', 'Unable to update profile settings.');
      });
  }

  $scope.openNameModal = function() {
    openModal({
      title: 'Name',
      inputs: [{
          placeholder: 'First name',
          type: 'text',
          fieldname: 'firstname'
        }, {
          placeholder: 'Last name',
          type: 'text',
          fieldname: 'lastname'
        }
      ]
    });
  };

  $scope.openEmailModal = function() {
    openModal({
      title: 'Email',
      inputs: [{
        placeholder: 'Email',
        type: 'email',
        fieldname: 'email'
      }]
    });
  };

  $scope.openDOBModal = function() {
    openModal({
      title: 'Date of Birth',
      inputs: [{
        placeholder: 'Date of Birth',
        type: 'date',
        fieldname: 'dob'
      }]
    });
  };

  $scope.updateNSFW = function() {
    User.update({
      show_nsfw: $scope.user.show_nsfw
    }).then(function() {
      Alerts.push('success', 'Successfully updated profile settings!');
    }, function() {
      Alerts.push('error', 'Unable to update profile settings.');
    });
  };
}]);
