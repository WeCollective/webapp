import Injectable from 'utils/injectable';

class NavBarController extends Injectable {
  constructor(...injections) {
    super(NavBarController.$inject, injections);

    this.animationSrc = '';
    this.expanded = false;
    this.notificationCount = 0;
  }

  isControlSelected(control) {
    return this.$state.current.name.indexOf(control) > -1 && this.$state.params.branchid === 'root';
  }

  logout() {
    this.expanded = false;
    this.UserService.logout()
      .then( () => {
        this.$state.go('auth.login');
      })
      .catch( () => {
        this.AlertsService.push('error', 'Unable to log out.');
      });
  }

  onHomePage() {
    return this.$state.current.name === 'weco.home';
  }

  showNotificationCount() {
    return this.notificationCount > 0;
  }

  toggleNav() {
    this.expanded = !this.expanded;
  }

  triggerAnimation() {
    // set animation src to the animated gif
    this.$timeout( () => { this.animationSrc = '/assets/images/logo-animation.gif'; });
    
    // cancel after 1 sec
    this.$timeout( () => { this.animationSrc = ''; }, 1000);
  }
}

NavBarController.$inject = [
  '$state',
  '$timeout',
  'AlertsService',
  'AppService',
  'UserService'
];

export default NavBarController;