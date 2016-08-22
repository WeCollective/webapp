var app = angular.module('wecoApp');
app.directive('navBar', ['User', '$state', function(User, $state) {
  return {
    restrict: 'E',
    replace: 'true',
    templateUrl: '/app/components/nav/nav.view.html',
    link: function($scope, element, attrs) {
      $scope.user = User.me;
      $scope.isLoggedIn = User.isLoggedIn;
      $scope.logout = function() {
        User.logout().then(function() {
          // successful logout; go to login page
          $state.go('auth.login');
        }, function() {
          // TODO: pretty error
          alert('Unable to log out!');
        });
      };

      // return true if the given branch control is selected,
      // i.e. if the current state contains the control name
      $scope.isControlSelected = function(control) {
        return $state.current.name.indexOf(control) > -1;
      };

      $scope.onHomePage = function() {
        return $state.current.name == 'weco.home';
      };
    }
  };
}]);
