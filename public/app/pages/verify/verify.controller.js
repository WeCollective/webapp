var app = angular.module('wecoApp');
app.controller('verifyController', ['$scope', '$state', '$interval', '$timeout', 'User', 'Alerts', function($scope, $state, $interval, $timeout, User, Alerts) {
  $scope.message = 'Verifying your account.';

  $interval(function () {
    if($scope.message.indexOf('...') > -1) {
      $scope.message = 'Verifying your account.';
    } else {
      $scope.message += '.';
    }
  }, 1000);

  $timeout(function () {
    User.verify($state.params.username, $state.params.token).then(function() {
      $state.go('auth.login');
      Alerts.push('success', 'Account verified! You can now login.', true);
    }, function(err) {
      Alerts.push('error', 'Unable to verify your account. Your token may have expired: try signing up again.', true);
      $state.go('auth.signup');
    });
  }, 3000);
}]);
