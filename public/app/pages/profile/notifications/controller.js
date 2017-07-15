import Injectable from 'utils/injectable';
import NotificationTypes from 'components/notification/constants';

class ProfileNotificationsController extends Injectable {
  constructor(...injections) {
    super(ProfileNotificationsController.$inject, injections);

    this.isLoading = false;
    this.NotificationTypes = NotificationTypes;
    this.notifications = this.LocalStorageService.getObject('cache').profileNotifications || [];

    this.init();

    this.init = this.init.bind(this);

    let listeners = [];

    listeners.push(this.EventService.on(this.EventService.events.CHANGE_USER, this.init));

    listeners.push(this.EventService.on(this.EventService.events.SCROLLED_TO_BOTTOM, name => {
      if ('NotificationsScrollToBottom' !== name) return;
        
      if (this.notifications.length) {
        this.getNotifications(this.notifications[this.notifications.length - 1].id);
      }
    }));

    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  getNotificationImageType(notification) {
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
  }

  getNotifications(lastNotificationId) {
    if (this.isLoading === true) return;

    this.isLoading = true;

    this.UserService.getNotifications(this.$state.params.username, false, lastNotificationId)
      .then(notifications => {
        this.$timeout(() => {
          this.notifications = lastNotificationId ? this.notifications.concat(notifications) : notifications;
          this.isLoading = false;

          let cache = this.LocalStorageService.getObject('cache');
          cache.profileNotifications = this.notifications;
          this.LocalStorageService.setObject('cache', cache);
        });
      })
      .catch(() => this.AlertsService.push('error', 'Unable to fetch notifications.'));
  }

  init() {
    if (!this.$state.current.name.includes('weco.profile')) return;

    if (this.UserService.isAuthenticated() && this.UserService.user.username === this.$state.params.username) {
      this.$timeout(() => this.getNotifications());
    }
  }

  toggleUnreadState(notification) {
    this.UserService.markNotification(this.UserService.user.username, notification.id, !notification.unread)
      .then(() => {
        this.EventService.emit('UNREAD_NOTIFICATION_CHANGE', !notification.unread ? 1 : -1);
        this.$timeout(() => notification.unread = !notification.unread);
      })
      .catch(() => this.AlertsService.push('error', 'Unable to mark notification.'));
  }
}

ProfileNotificationsController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'AlertsService',
  'EventService',
  'LocalStorageService',
  'UserService',
];

export default ProfileNotificationsController;
