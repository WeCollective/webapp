var app = angular.module('wecoApp');
app.controller('requestResetPasswordController', ['$scope', '$state', '$timeout', 'User', 'Alerts', function($scope, $state, $timeout, User, Alerts) {
  $scope.sendLink = function() {
    $scope.isLoading = true;
    User.requestResetPassword($scope.credentials.username).then(function() {
      $state.go('weco.home');
      $scope.isLoading = false;
      Alerts.push('success', 'A password reset link has been sent to your inbox.', true);
    }, function(response) {
      $scope.isLoading = false;
      $scope.errorMessage = response.message;
    });
  };
}]);
