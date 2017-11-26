import Injectable from 'utils/injectable';

class Notification extends Injectable {
  constructor(...injections) {
    super(Notification.$inject, injections);

    const cache = this.LocalStorageService.getObject('cache').notifications || {};
    this.notifications = cache.items || [];
  }

  getNotifications(username, lastNotificationId) {
    return this.UserService.getNotifications(username, false, lastNotificationId)
      .then(notifications => {
        this.$timeout(() => {
          this.notifications = lastNotificationId ?
            this.notifications.concat(notifications)
            : notifications;

          const cache = this.LocalStorageService.getObject('cache');
          cache.notifications = cache.notifications || {};
          cache.notifications.items = this.notifications;
          this.LocalStorageService.setObject('cache', cache);
          return Promise.resolve();
        });
      })
      .catch(() => {
        this.AlertsService.push('error', 'Unable to fetch notifications.');
        return Promise.reject();
      });
  }

  markAllNotificationsRead() {
    this.notifications.forEach(notification => {
      notification.unread = false;
    });
  }

  markAsRead(index) {
    this.toggleUnreadState(index, false)
  }

  toggleUnreadState(index, forceValue) {
    const notification = this.notifications[index];
    const {
      id,
      unread,
    } = notification;

    const newValue = forceValue !== undefined ? forceValue : !unread;

    this.UserService.markNotification(this.UserService.user.username, id, newValue)
      .then(() => {
        this.EventService.emit('UNREAD_NOTIFICATION_CHANGE', newValue ? 1 : -1);
        this.$timeout(() => notification.unread = newValue);
      })
      .catch(() => this.AlertsService.push('error', 'Unable to mark notification.'));// 
  }
}

Notification.$inject = [
  '$timeout',
  'AlertsService',
  'EventService',
  'LocalStorageService',
  'UserService',
];

export default Notification;
