import Injectable from 'utils/injectable';
import NotificationTypes from 'components/notification/constants';

class ProfileNotificationsController extends Injectable {
  constructor(...injections) {
    super(ProfileNotificationsController.$inject, injections);

    const cache = this.LocalStorageService.getObject('cache').notifications || {};

    this.isLoading = false;
    this.NotificationTypes = NotificationTypes;
    this.notifications = cache.items || [];

    this.init();

    this.init = this.init.bind(this);

    const listeners = [];
    const { events } = this.EventService;

    listeners.push(this.EventService.on(events.CHANGE_USER, this.init));

    listeners.push(this.EventService.on(events.MARK_ALL_NOTIFICATIONS_READ, () => {
      this.markAllNotificationsRead();
    }));

    listeners.push(this.EventService.on(events.SCROLLED_TO_BOTTOM, name => {
      if (name !== 'ScrollToBottom') return;

      if (this.notifications.length) {
        this.getNotifications(this.notifications[this.notifications.length - 1].id);
      }
    }));

    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  getNotificationImageType(notification) {
    switch (notification.type) {
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
    this.EventService.emit(this.EventService.events.LOADING_ACTIVE);
    this.isLoading = true;

    this.UserService.getNotifications(this.$state.params.username, false, lastNotificationId)
      .then(notifications => {
        this.$timeout(() => {
          this.notifications = lastNotificationId ?
            this.notifications.concat(notifications)
            : notifications;
          this.EventService.emit(this.EventService.events.LOADING_INACTIVE);
          this.isLoading = false;

          const cache = this.LocalStorageService.getObject('cache');
          cache.notifications = cache.notifications || {};
          cache.notifications.items = this.notifications;
          this.LocalStorageService.setObject('cache', cache);
        });
      })
      .catch(() => {
        this.EventService.emit(this.EventService.events.LOADING_INACTIVE);
        this.isLoading = false;
        this.AlertsService.push('error', 'Unable to fetch notifications.');
      });
  }

  init() {
    if (!this.$state.current.name.includes('weco.profile')) return;

    if (this.UserService.isAuthenticated() &&
      this.UserService.user.username === this.$state.params.username) {
      this.$timeout(() => this.getNotifications());
    }
  }

  markAllNotificationsRead() {
    this.notifications.forEach(notification => {
      notification.unread = false;
    });
  }

  toggleUnreadState(notification) {
    const {
      id,
      unread,
    } = notification;

    this.UserService.markNotification(this.UserService.user.username, id, !unread)
      .then(() => {
        this.EventService.emit('UNREAD_NOTIFICATION_CHANGE', !unread ? 1 : -1);
        this.$timeout(() => notification.unread = !unread);
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
