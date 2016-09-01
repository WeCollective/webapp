var app = angular.module('wecoApp');
app.controller('profileNotificationsController', ['$scope', '$state', '$timeout', 'User', 'NotificationTypes', function($scope, $state, $timeout, User, NotificationTypes) {
  $scope.isLoading = false;
  $scope.NotificationTypes = NotificationTypes;
  $scope.me = User.me;
  $scope.notifications = [];

  function getNotifications() {
    $scope.isLoading = true;

    User.getNotifications($state.params.username).then(function(notifications) {
      $timeout(function() {
        $scope.notifications = notifications;
        $scope.isLoading = false;
      });
    }, function() {
      // TODO pretty error
      console.error('Unable to fetch notifications');
    });
  }

  $scope.toggleUnread = function(notification) {
    User.markNotification(User.me().username, notification.id, !notification.unread).then(function() {
      $timeout(function() {
        notification.unread = !notification.unread;
      });
    }, function(err) {
      // TODO handle error
      console.error("Unable to mark notification! ", err);
    });
  };

  // initial fetch of notifications
  getNotifications();
}]);
