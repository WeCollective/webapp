var app = angular.module('wecoApp');
app.controller('modalNucleusUpdateHomepageStatsController', ['$scope', '$timeout', 'Modal', 'Alerts', '$http', 'ENV', function($scope, $timeout, Modal, Alerts, $http, ENV) {
  $scope.Modal = Modal;
  $scope.errorMessage = '';
  $scope.isLoading = true;
  $scope.stats = {
    donation_total: 0,
    raised_total: 0
  };

  // fetch current values
  $http({
    method: 'GET',
    url: ENV.apiEndpoint + 'constant/donation_total'
  }).then(function(result) {
    $scope.stats.donation_total = result.data.data.data;
    return $http({
      method: 'GET',
      url: ENV.apiEndpoint + 'constant/raised_total'
    });
  }).then(function(result) {
    $timeout(function() {
      $scope.stats.raised_total = result.data.data.data;
      $scope.isLoading = false;
    });
  }).catch(function() {
    Alerts.push('error', 'Error updating homepage stats.');
    Modal.Cancel();
  });

  $scope.$on('OK', function() {
    $scope.isLoading = true;
    
    if(isNaN($scope.stats.donation_total) || isNaN($scope.stats.raised_total)) {
      $timeout(function () {
        $scope.errorMessage = 'Invalid amount';
        $scope.isLoading = false;
      });
      return;
    }

    // update donation_total
    $http({
      method: 'PUT',
      url: ENV.apiEndpoint + 'constant/donation_total',
      data: {
        data: Number($scope.stats.donation_total)
      }
    }).then(function() {
      // update donation_total
      return $http({
        method: 'PUT',
        url: ENV.apiEndpoint + 'constant/raised_total',
        data: {
          data: Number($scope.stats.raised_total)
        }
      });
    }).then(function () {
      $timeout(function() {
        $scope.isLoading = false;
        Modal.OK();
      });
    }).catch(function() {
      Alerts.push('error', 'Error updating homepage stats.');
      Modal.Cancel();
    });
  });

  $scope.$on('Cancel', function() {
    $timeout(function() {
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.Cancel();
    });
  });
}]);
