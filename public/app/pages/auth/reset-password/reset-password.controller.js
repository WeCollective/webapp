var app = angular.module('wecoApp');
app.controller('resetPasswordController', ['$scope', '$state', '$timeout', 'User', 'Alerts', function($scope, $state, $timeout, User, Alerts) {
  $scope.errorMessage = '';
  $scope.isLoading = false;
  $scope.loopAnimation = false;
  $scope.credentials = {};

  var animationSrc = '/assets/images/logo-animation-large.gif';
  $scope.triggerAnimation = function() {
    if(animationSrc !== '') {
      $timeout(function() {
        animationSrc = '';
      });
    }
    // set animation src to the animated gif
    $timeout(function () {
      animationSrc = '/assets/images/logo-animation-large.gif';
    });
    // cancel after 1 sec
    $timeout(function () {
      animationSrc = '';
      if($scope.loopAnimation) $scope.triggerAnimation();
    }, 1000);
  };

  $scope.setLoopAnimation = function(loop) { $scope.loopAnimation = loop; };
  $scope.setErrorMessage = function(message) { $scope.errorMessage = message; };
  $scope.setLoading = function(loading) { $scope.isLoading = loading; };

  $scope.getAnimationSrc = function () {
    return animationSrc;
  };
}]);
