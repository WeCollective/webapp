var app = angular.module('wecoApp');
app.controller('profileNotificationsController', ['$scope', '$state', '$timeout', 'User', function($scope, $state, $timeout, User) {
  $scope.isLoading = false;
  $scope.notifications = [];

  // Asynchronously load the notifications data one by one
  function loadProfileUrls(notifications, idx) {
    var target = notifications.shift();
    if(target) {
      User.getPictureUrl($scope.notifications[idx].data.username, 'picture', true).then(function(response) {
        if(response) {
          $timeout(function() {
            $scope.notifications[idx].profileUrl = response.data.data;
          });
        }
        loadProfileUrls(notifications, idx + 1);
      }).catch(function () {
        // Unable to fetch this profile url - continue
        loadProfileUrls(notifications, idx + 1);
      });
    }
  }

  function getNotifications() {
    $scope.isLoading = true;

    User.getNotifications($state.params.username).then(function(notifications) {
      $timeout(function() {
        $scope.notifications = notifications;
        $scope.isLoading = false;
        // slice() provides a clone of the notifications array
        loadProfileUrls($scope.notifications.slice(), 0);
      });
    }, function() {
      // TODO pretty error
      console.error('Unable to fetch notifications');
    });
  }

  getNotifications();
}]);
