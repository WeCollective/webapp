var app = angular.module('wecoApp');
app.controller('profileNotificationsController', ['$scope', '$state', '$timeout', 'User', 'NotificationTypes', 'Alerts', function($scope, $state, $timeout, User, NotificationTypes, Alerts) {
  $scope.isLoading = false;
  $scope.NotificationTypes = NotificationTypes;
  $scope.me = User.me;
  $scope.notifications = [];

  $scope.getNotificationImageType = function(notification) {
    switch(notification.type) {
      case NotificationTypes.NEW_CHILD_BRANCH_REQUEST:
      case NotificationTypes.CHILD_BRANCH_REQUEST_ANSWERED:
      case NotificationTypes.BRANCH_MOVED:
        return 'branch';
      case NotificationTypes.MODERATOR:
        return 'moderator';
      case NotificationTypes.COMMENT:
        return 'comment';
      default:
        return 'user';
    }
  };

  function getNotifications() {
    $scope.isLoading = true;

    User.getNotifications($state.params.username).then(function(notifications) {
      $timeout(function() {
        $scope.notifications = notifications;
        $scope.isLoading = false;
      });
    }, function() {
      Alerts.push('error', 'Unable to fetch notifications.');
    });
  }

  $scope.setUnread = function(notification, unread) {
    User.markNotification(User.me().username, notification.id, unread).then(function() {
      $timeout(function() {
        notification.unread = unread;
      });
    }, function(err) {
      Alerts.push('error', 'Unable to mark notification.');
    });
  };

  // initial fetch of notifications
  getNotifications();
}]);
