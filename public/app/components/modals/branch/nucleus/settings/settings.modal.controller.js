var app = angular.module('wecoApp');
app.controller('modalNucleusSettingsController', ['$scope', '$timeout', 'Modal', 'Branch', function($scope, $timeout, Modal, Branch) {
  $scope.Modal = Modal;
  $scope.inputValues = [];
  $scope.textareaValues = [];
  $scope.errorMessage = '';
  $scope.isLoading = false;

  /* jshint shadow:true */
  for(var i = 0; i < Modal.getInputArgs().textareas.length; i++) {
    $scope.textareaValues[i] = Modal.getInputArgs().textareas[i].value;
  }
  for(var i = 0; i < Modal.getInputArgs().inputs.length; i++) {
    $scope.inputValues[i] = Modal.getInputArgs().inputs[i].value;
  }

  $scope.$on('OK', function() {
    // if not all fields are filled, display message
    if($scope.inputValues.length < Modal.getInputArgs().inputs.length || $scope.inputValues.indexOf('') > -1 ||
       $scope.textareaValues.length < Modal.getInputArgs().textareas.length || $scope.textareaValues.indexOf('') > -1) {
      $timeout(function() {
        $scope.errorMessage = 'Please fill in all fields';
      });
      return;
    }

    // construct data to update using the proper fieldnames
    /* jshint shadow:true */
    var updateData = {};
    for(var i = 0; i < Modal.getInputArgs().inputs.length; i++) {
      updateData[Modal.getInputArgs().inputs[i].fieldname] = $scope.inputValues[i];

      // convert date input values to unix timestamp
      if(Modal.getInputArgs().inputs[i].type == 'date') {
        updateData[Modal.getInputArgs().inputs[i].fieldname] = new Date($scope.inputValues[i]).getTime();
      }
    }
    for(var i = 0; i < Modal.getInputArgs().textareas.length; i++) {
      updateData[Modal.getInputArgs().textareas[i].fieldname] = $scope.textareaValues[i];
    }

    // perform the update
    $scope.isLoading = true;
    Branch.update(updateData).then(function() {
      $timeout(function() {
        $scope.inputValues = [];
        $scope.textareaValues = [];
        $scope.errorMessage = '';
        $scope.isLoading = false;
        Modal.OK();
      });
    }, function(response) {
      $timeout(function() {
        $scope.errorMessage = response.message;
        $scope.isLoading = false;
      });
    });
  });

  $scope.$on('Cancel', function() {
    $timeout(function() {
      $scope.inputValues = [];
      $scope.textareaValues = [];
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.Cancel();
    });
  });
}]);
