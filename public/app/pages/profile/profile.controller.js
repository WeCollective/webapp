import Injectable from 'utils/injectable';

class ProfileController extends Injectable {
  constructor(...injections) {
    super(ProfileController.$inject, injections);

    this.showCover = true;
    this.isLoading = false;
    this.tabItems = ['about'];
    this.tabStates = ['weco.profile.about'];
    this.profileUser = {};

    let loadOtherUser = () => {
      // ensure we are in the 'about' state
      if(this.$state.current.name !== 'weco.profile.about') {
        this.$state.go('weco.profile.about', { username: this.$state.params.username }).then(init);
      } else {
        this.isLoading = true;
        this.UserService.fetch(this.$state.params.username).then((user) => {
          this.profileUser = user;
          this.isLoading = false;
        })
        .catch((err) => {
          if(err.status === 404) {
            return this.$state.go('weco.notfound');
          } else {
            this.AlertsService.push('error', 'Unable to fetch user.');
            this.$state.go('weco.home');
          }
          this.isLoading = false;
        })
        .then(this.$timeout);
      }
    };

    let init = () => {
      if(this.$state.current.name.indexOf('weco.profile') === -1) return;
      if(this.UserService.isAuthenticated() && this.UserService.user.username === this.$state.params.username) {
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
      } else {
        loadOtherUser();
      }
    };

    init();
    this.EventService.on(this.EventService.events.CHANGE_USER, init);
  }

  openProfilePictureModal() {
    this.ModalService.open(
      'UPLOAD_IMAGE',
      {
        route: 'user/me/',
        type: 'picture'
      },
      'Successfully updated profile picture.',
      'Unable to update profile picture.'
    );
  }

  openCoverPictureModal() {
    this.ModalService.open(
      'UPLOAD_IMAGE',
      {
        route: 'user/me/',
        type: 'cover'
      },
      'Successfully updated cover picture.',
      'Unable to update cover picture.'
    );
  }
}
ProfileController.$inject = ['$timeout', '$state', 'UserService', 'ModalService', 'AlertsService', 'EventService'];

export default ProfileController;
