import Injectable from 'utils/injectable';

import Branch from 'assets/icons/white/branch.png';
import Notification from 'assets/icons/white/notification.png';
import Nucleus from 'assets/icons/white/nucleus.png';
import Logo from 'assets/nav-logo.png';
import LogoAnimation from 'assets/logo-animation.gif';
import ProfilePicture from 'assets/default-profile.jpg';
import ShowMore from 'assets/icons/white/nav-expand.png';
import Wall from 'assets/icons/white/wall.png';

class NavbarController extends Injectable {
  constructor(...injections) {
    super(NavbarController.$inject, injections);

    this.getNotifications = this.getNotifications.bind(this);
    this.updateCount = this.updateCount.bind(this);

    const cache = this.LocalStorageService.getObject('cache').notifications || {};

    this.animationSrc = '';
    this.branch = Branch;
    this.defaultPicture = ProfilePicture;
    this.expanded = false;
    this.logo = Logo;
    this.notification = Notification;
    this.notificationCount = cache.count || 0;
    this.nucleus = Nucleus;
    this.showMore = ShowMore;
    this.wall = Wall;

    this.getNotifications();

    const listeners = [];
    const { events } = this.EventService;
    listeners.push(this.EventService.on(events.CHANGE_USER, this.getNotifications));
    listeners.push(this.EventService.on('UNREAD_NOTIFICATION_CHANGE', this.updateCount));
    listeners.push(this.EventService.on(events.MARK_ALL_NOTIFICATIONS_READ, this.updateCount));
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  cacheNotifications() {
    const cache = this.LocalStorageService.getObject('cache');
    cache.notifications = cache.notifications || {};
    cache.notifications.count = this.notificationCount;
    this.LocalStorageService.setObject('cache', cache);
  }

  getNotifications() {
    if (!this.UserService.user.username) return;

    this.UserService.getNotifications(this.UserService.user.username, true)
      .then(count => {
        this.notificationCount = count;

        const cache = this.LocalStorageService.getObject('cache');
        cache.notifications = cache.notifications || {};
        cache.notifications.count = this.notificationCount;
        this.LocalStorageService.setObject('cache', cache);

        // Sometimes the notifications badge would not get updated.
        this.$scope.$apply();
      })
      .catch(() => this.AlertsService.push('error', 'Unable to fetch notifications.'));
  }

  isControlSelected(control) {
    return this.$state.current.name.includes(control) && this.$state.params.branchid === 'root';
  }

  logout() {
    this.expanded = false;
    this.UserService.logout()
      .then(() => this.$state.go('auth.login'))
      .catch(() => this.AlertsService.push('error', 'Unable to log out.'));
  }

  onHomePage() {
    return this.$state.current.name === 'weco.home';
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  toggleNav() {
    this.expanded = !this.expanded;
  }

  triggerAnimation() {
    this.$timeout(() => {
      this.animationSrc = LogoAnimation;

      this.$timeout(() => this.animationSrc = '', 1000);
    });
  }

  updateCount(delta) {
    if (delta === undefined) {
      this.notificationCount = 0;
    }
    else {
      this.notificationCount += delta;
    }
    this.cacheNotifications();
  }
}

NavbarController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'AlertsService',
  'AppService',
  'EventService',
  'LocalStorageService',
  'UserService',
];

export default NavbarController;
