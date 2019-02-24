import Injectable from 'utils/injectable';
import NotificationTypes from 'components/notification/constants';

class ProfileNotificationsController extends Injectable {
  constructor(...injections) {
    super(ProfileNotificationsController.$inject, injections);

    this.isLoading = false;
    this.NotificationTypes = NotificationTypes;

    this.init();
    this.init = this.init.bind(this);

    const listeners = [];
    const { events } = this.EventService;
    const notifs = this.NotificationService;

    listeners.push(this.EventService.on(events.CHANGE_USER, this.init));

    listeners.push(this.EventService.on(
      events.MARK_ALL_NOTIFICATIONS_READ,
      () => notifs.markAllNotificationsRead(),
    ));

    listeners.push(this.EventService.on(events.SCROLLED_TO_BOTTOM, () => {
      const { notifications } = notifs;
      if (notifications.length) {
        this.getNotifications(notifications[notifications.length - 1].id);
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

    this.NotificationService.getNotifications(this.$state.params.username, lastNotificationId)
      .then(() => {
        this.EventService.emit(this.EventService.events.LOADING_INACTIVE);
        this.isLoading = false;
      })
      .catch(() => {
        this.EventService.emit(this.EventService.events.LOADING_INACTIVE);
        this.isLoading = false;
      });
  }

  init() {
    if (!this.$state.current.name.includes('weco.profile')) return;

    if (this.UserService.isAuthenticated() &&
      this.UserService.user.username === this.$state.params.username) {
      this.$timeout(() => this.getNotifications());
    }
  }
}

ProfileNotificationsController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'EventService',
  'NotificationService',
  'UserService',
];

export default ProfileNotificationsController;
