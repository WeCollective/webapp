var app = angular.module('wecoApp');
app.directive('navBar', ['User', '$state', function(User, $state) {
  return {
    restrict: 'E',
    replace: 'true',
    templateUrl: '/app/nav/nav.view.html',
    link: function($scope, element, attrs) {
      $scope.user = User.data;
      $scope.isLoggedIn = User.isLoggedIn;
      $scope.logout = function() {
        User.logout().then(function() {
          // successful logout; go to login page
          $state.go('weco.login');
        }, function() {
          // TODO: pretty error
          alert('Unable to log out!');
        });
      };
    }
  };
}]);
