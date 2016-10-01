var app = angular.module('wecoApp');
app.controller('profileNotificationsController', ['$scope', '$state', '$timeout', 'User', 'NotificationTypes', 'Alerts', function($scope, $state, $timeout, User, NotificationTypes, Alerts) {
  $scope.isLoading = false;
  $scope.isLoadingMore = false;
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
      case NotificationTypes.POST_FLAGGED:
      case NotificationTypes.POST_REMOVED:
      case NotificationTypes.POST_TYPE_CHANGED:
        return 'flagged';
      default:
        return 'user';
    }
  };

  function getNotifications(lastNotificationId) {
    $scope.isLoading = true;

    User.getNotifications($state.params.username, false, lastNotificationId).then(function(notifications) {
      $timeout(function() {
        if(lastNotificationId) {
          $scope.notifications = $scope.notifications.concat(notifications);
        } else {
          $scope.notifications = notifications;
        }
        $scope.isLoading = false;
        $scope.isLoadingMore = false;
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

  $scope.loadMore = function() {
    if(!$scope.isLoadingMore) {
      $scope.isLoadingMore = true;
      if($scope.notifications.length > 0) getNotifications($scope.notifications[$scope.notifications.length - 1].id);
    }
  };

  // initial fetch of notifications
  getNotifications();

  $scope.reasonString = function(reason) {
    switch(reason) {
      case 'branch_rules':
        return 'for violating the branch rules';
      case 'site_rules':
        return 'for violating the site rules';
      case 'wrong_type':
        return 'for being tagged with an incorrect post type';
      default:
        return '';
    }
  };
}]);
