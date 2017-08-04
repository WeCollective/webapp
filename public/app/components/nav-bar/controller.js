import Injectable from 'utils/injectable';

class NavbarController extends Injectable {
  constructor(...injections) {
    super(NavbarController.$inject, injections);

    this.getNotifications = this.getNotifications.bind(this);
    this.updateCount = this.updateCount.bind(this);

    const cache = this.LocalStorageService.getObject('cache').notifications || {};

    this.animationSrc = '';
    this.expanded = false;
    this.notificationCount = cache.count || 0;

    this.getNotifications();

    const listeners = [];
    listeners.push(this.EventService.on(this.EventService.events.CHANGE_USER, this.getNotifications));
    listeners.push(this.EventService.on('UNREAD_NOTIFICATION_CHANGE', this.updateCount));
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  getNotifications() {
    if (!this.UserService.user.username) return;

    this.UserService.getNotifications(this.UserService.user.username, true)
      .then(count => {
        this.notificationCount = count;

        let cache = this.LocalStorageService.getObject('cache');
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
      this.animationSrc = '/assets/images/logo-animation.gif';

      this.$timeout(() => this.animationSrc = '', 1000);
    });
  }

  updateCount(delta) {
    this.notificationCount += delta;

    let cache = this.LocalStorageService.getObject('cache');
    cache.notifications = cache.notifications || {};
    cache.notifications.count = this.notificationCount;
    this.LocalStorageService.setObject('cache', cache);
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
