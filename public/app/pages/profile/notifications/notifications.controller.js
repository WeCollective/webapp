import Injectable from 'utils/injectable';
import NotificationTypes from 'components/notification/notification-types.config';

class ProfileNotificationsController extends Injectable {
  constructor(...injections) {
    super(ProfileNotificationsController.$inject, injections);

    this.isLoading = false;
    this.isLoadingMore = false;
    this.NotificationTypes = NotificationTypes;
    this.notifications = [];

    let init = () => {
      if(this.$state.current.name.indexOf('weco.profile') === -1) return;

      this.getNotifications();
    };

    init();
    this.EventService.on(this.EventService.events.CHANGE_USER, init);
    this.EventService.on(this.EventService.events.SCROLLED_TO_BOTTOM, (name) => {
      if(name !== 'NotificationsScrollToBottom') return;
      if(!this.isLoadingMore) {
        this.isLoadingMore = true;
        if(this.notifications.length > 0) this.getNotifications(this.notifications[this.notifications.length - 1].id);
      }
    });
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
    this.isLoading = true;

    this.UserService.getNotifications(this.$state.params.username, false, lastNotificationId).then((notifications) => {
      this.$timeout(() => {
        if(lastNotificationId) {
          this.notifications = this.notifications.concat(notifications);
        } else {
          this.notifications = notifications;
        }
        this.isLoading = false;
        this.isLoadingMore = false;
      });
    }).catch(() => {
      this.AlertsService.push('error', 'Unable to fetch notifications.');
    });
  }

  setUnread(notification, unread) {
    this.UserService.markNotification(this.UserService.user.username, notification.id, unread).then(() => {
      this.$timeout(() => { notification.unread = unread; });
    }).catch((err) => {
      this.AlertsService.push('error', 'Unable to mark notification.');
    });
  }
}
ProfileNotificationsController.$inject = ['$timeout', '$state', 'UserService', 'AlertsService', 'EventService'];

export default ProfileNotificationsController;
