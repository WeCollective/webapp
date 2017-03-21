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
    let update = () => {
      this.$timeout(() => {
        this.profileUser = this.UserService.user;
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
    };
    this.EventService.on(this.EventService.events.CHANGE_USER, update);

    // initial fetch of the viewed user
    if(this.UserService.user.username === this.$state.params.username) {
      // viewing own profile
      this.isLoading = false;
      update();
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

  openProfilePictureModal() {
    this.ModalService.open('/app/components/modal/upload-image/upload-image.modal.view.html', { route: 'user/me/', type: 'picture' })
      .then((result) => {
        // reload state to force profile reload if OK was pressed
        if(result) {
          this.$state.go(this.$state.current, {}, { reload: true });
        }
      }).catch(() => {
        this.AlertsService.push('error', 'Unable to change profile picture.');
      });
  }

  openCoverPictureModal() {
    this.ModalService.open('/app/components/modal/upload-image/upload-image.modal.view.html', { route: 'user/me/', type: 'cover' })
      .then((result) => {
        // reload state to force profile reload if OK was pressed
        if(result) {
          this.$state.go(this.$state.current, {}, { reload: true });
        }
      }).catch(() => {
        this.AlertsService.push('error', 'Unable to change cover picture.');
      });
  }
}
ProfileController.$inject = ['$timeout', '$state', 'EventService', 'UserService', 'ModalService', 'AlertsService'];

export default ProfileController;
