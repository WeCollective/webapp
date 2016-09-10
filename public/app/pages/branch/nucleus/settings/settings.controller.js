'use strict';

var app = angular.module('wecoApp');
app.controller('nucleusSettingsController', ['$scope', '$state', '$timeout', 'Modal', 'Alerts', function($scope, $state, $timeout, Modal, Alerts) {

  function openModal(args) {
    Modal.open('/app/components/modals/branch/nucleus/settings/settings.modal.view.html', args)
      .then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        Alerts.push('error', 'Error updating branch settings.');
      });
  }

  $scope.openVisibleNameModal = function() {
    openModal({
      title: 'Visible Name',
      inputs: [
        {
          placeholder: 'Visible name',
          type: 'text',
          fieldname: 'name'
        }
      ],
      textareas: []
    });
  };

  $scope.openRulesModal = function() {
    openModal({
      title: 'Rules & Etiquette',
      inputs: [],
      textareas: [
        {
          placeholder: 'Rules & Etiquette Text',
          fieldname: 'rules'
        }
      ]
    });
  };

  $scope.openDescriptionModal = function() {
    openModal({
      title: 'Description',
      inputs: [],
      textareas: [
        {
          placeholder: 'Description',
          fieldname: 'description'
        }
      ]
    });
  };
}]);
