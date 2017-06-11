import Injectable from 'utils/injectable';

class NavbarController extends Injectable {
  constructor (...injections) {
    super(NavbarController.$inject, injections);

    this.getNotifications = this.getNotifications.bind(this);

    this.animationSrc = '';
    this.expanded = false;
    this.notificationCount = 0;

    this.getNotifications();

    this.EventService.on(this.EventService.events.CHANGE_USER, this.getNotifications);

    this.EventService.on('UNREAD_NOTIFICATION_CHANGE', delta => this.notificationCount += delta);
  }

  getNotifications () {
    if (!this.UserService.user.username) return;

    this.UserService.getNotifications(this.UserService.user.username, true)
      .then(count => {
        this.notificationCount = count;
        
        // Sometimes the notifications badge would not get updated.
        this.$scope.$apply();
      })
      .catch(_ => this.AlertsService.push('error', 'Unable to fetch notifications.'));
  }

  isControlSelected (control) {
    return this.$state.current.name.includes(control) && this.$state.params.branchid === 'root';
  }

  logout () {
    this.expanded = false;
    this.UserService.logout()
      .then(_ => this.$state.go('auth.login'))
      .catch(_ => this.AlertsService.push('error', 'Unable to log out.'));
  }

  onHomePage () {
    return this.$state.current.name === 'weco.home';
  }

  toggleNav () {
    this.expanded = !this.expanded;
  }

  triggerAnimation () {
    // set animation src to the animated gif
    this.$timeout(_ => this.animationSrc = '/assets/images/logo-animation.gif');
    
    // cancel after 1 sec
    this.$timeout(_ => this.animationSrc = '', 1000);
  }
}

NavbarController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'AlertsService',
  'AppService',
  'EventService',
  'UserService'
];

export default NavbarController;
