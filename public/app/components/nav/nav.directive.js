var app = angular.module('wecoApp');
app.directive('navBar', ['User', '$state', 'socket', function(User, $state, socket) {
  return {
    restrict: 'E',
    replace: 'true',
    templateUrl: '/app/components/nav/nav.view.html',
    link: function($scope, element, attrs) {
      $scope.user = User.me;
      $scope.isLoggedIn = User.isLoggedIn;

      $scope.logout = function() {
        $scope.expanded = false;
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
        return $state.current.name.indexOf(control) > -1 && $state.params.branchid == 'root';
      };

      $scope.onHomePage = function() {
        return $state.current.name == 'weco.home';
      };

      $scope.expanded = false;
      $scope.isNavExpanded = function() {
        return $scope.expanded;
      };

      $scope.toggleNav = function() {
        $scope.expanded = !$scope.expanded;
      };

      socket.notifications.on('news', function (data) {
        console.log(data);
        socket.notifications.emit('my other event', { my: 'data' });
      });

    }
  };
}]);
