var app = angular.module('wecoApp');
app.directive('navBar', ['User', '$state', '$timeout', 'socket', function(User, $state, $timeout, socket) {
  return {
    restrict: 'E',
    replace: 'true',
    templateUrl: '/app/components/nav/nav.view.html',
    link: function($scope, element, attrs) {
      $scope.user = User.me;

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

      $scope.notificationCount = 0;
      function getUnreadNotificationCount() {
        if(!User.me().username) { return; }
        User.getNotifications(User.me().username, true).then(function(count) {
          $timeout(function () {
            $scope.notificationCount = count;
          });
        }, function(err) {
          // TODO pretty error
          console.error("Error fetching notification count");
        });
      }

      $scope.$watch(function() {
        return User.me().username;
      }, function() {
        getUnreadNotificationCount();
      });

      $scope.$on('$stateChangeSuccess', getUnreadNotificationCount);
      socket.on('notification', 'notifications', getUnreadNotificationCount);

      $scope.showNotificationCount = function() {
        return $scope.notificationCount > 0;
      };
    }
  };
}]);
