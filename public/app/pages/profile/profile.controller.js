import Injectable from 'utils/injectable';

class ProfileController extends Injectable {
  constructor(...injections) {
    super(ProfileController.$inject, injections);

    this.showCover = true;
    this.isLoading = true;
    this.tabItems = ['about'];
    this.tabStates = ['weco.profile.about'];

    this.EventService.on(this.EventService.events.CHANGE_USER, () => {
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
    });
  }
}
ProfileController.$inject = ['$timeout', '$state', 'EventService', 'UserService'];

export default ProfileController;
