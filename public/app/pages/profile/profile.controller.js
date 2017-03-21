import Injectable from 'utils/injectable';

class ProfileController extends Injectable {
  constructor(...injections) {
    super(ProfileController.$inject, injections);

    this.showCover = true;
    this.isLoading = true;
    this.tabItems = ['about'];
    this.tabStates = ['weco.profile.about'];
    this.profileUser = {};

    // add settings and notifications tab iff. viewing own profile
    let updateTabs = () => {
      if(this.UserService.user.username === this.$state.params.username) {
        if(this.tabItems.indexOf('settings') === -1 && this.tabStates.indexOf('weco.profile.settings') === -1) {
          this.tabItems.push('settings');
          this.tabStates.push('weco.profile.settings');
        }
        if(this.tabItems.indexOf('notifications') === -1 && this.tabStates.indexOf('weco.profile.notifications') === -1) {
          this.tabItems.push('notifications');
          this.tabStates.push('weco.profile.notifications');
        }
      }
    };
    this.EventService.on(this.EventService.events.CHANGE_USER, updateTabs);

    // initial fetch of the viewed user
    if(this.UserService.user.username === this.$state.params.username) {
      // viewing own profile
      this.$timeout(() => {
        this.profileUser = this.UserService.user;
        this.isLoading = false;
        updateTabs();
      });
    } else {  // viewing another user's profile
      // ensure we are in the 'about' state
      if(this.$state.current.name !== 'weco.profile.about') {
        this.$state.go('weco.profile.about', { username: this.$state.params.username });
      } else {
        this.UserService.fetch(this.$state.params.username).then((user) => {
          this.profileUser = user;
        })
        .catch((err) => {
          if(err.status === 404) {
            this.$state.go('weco.notfound');
          } else {
            this.AlertsService.push('error', 'Unable to fetch user.');
            this.$state.go('weco.home');
          }
          this.isLoading = false;
        })
        .then(this.$timeout);
      }
    }
  }
}
ProfileController.$inject = ['$timeout', '$state', 'EventService', 'UserService', 'AlertsService'];

export default ProfileController;
