var app = angular.module('wecoApp');
app.controller('confirmResetPasswordController', ['$scope', '$state', '$timeout', 'User', 'Alerts', function($scope, $state, $timeout, User, Alerts) {
  $scope.resetPassword = function() {
    $scope.isLoading = true;
    if($scope.credentials.password != $scope.credentials.confirmPassword) {
      Alerts.push('error', 'The two passwords are different.');
      $scope.isLoading = false;
      return;
    }
    User.resetPassword($state.params.username, $scope.credentials.password, $state.params.token).then(function() {
      Alerts.push('success', 'Successfully updated password! You can now login.', true);
      $scope.isLoading = false;
      $state.go('auth.login');
    }, function(response) {
      $timeout(function () {
        $scope.errorMessage = response.message;
        $scope.isLoading = false;
      });
    });
  };
}]);
