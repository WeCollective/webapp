var app = angular.module('wecoApp');
app.controller('requestResetPasswordController', ['$scope', '$state', '$timeout', 'User', 'Alerts', function($scope, $state, $timeout, User, Alerts) {
  $scope.sendLink = function() {
    $scope.setLoading(true);
    $scope.setLoopAnimation(true);
    $scope.triggerAnimation();

    User.requestResetPassword($scope.credentials.username).then(function() {
      $state.go('weco.home');
      $scope.setLoading(false);
      $scope.setLoopAnimation(false);
      Alerts.push('success', 'A password reset link has been sent to your inbox.', true);
    }, function(response) {
      $scope.setLoading(false);
      $scope.setErrorMessage(response.message);
      $scope.setLoopAnimation(false);
    });
  };
}]);
