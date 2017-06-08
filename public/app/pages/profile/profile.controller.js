import Injectable from 'utils/injectable';

class ProfileController extends Injectable {
  constructor(...injections) {
    super(ProfileController.$inject, injections);

    this.isLoading = false;
    this.profileUser = {};
    this.showCover = true;
    this.tabItems = ['about'];
    this.tabStates = ['weco.profile.about'];    

    const loadOtherUser = _ => {
      // ensure we are in the 'about' state
      if ('weco.profile.about' !== this.$state.current.name) {
        this.$state.go('weco.profile.about', { username: this.$state.params.username }).then(init);
      }
      else {
        this.isLoading = true;
        this.UserService.fetch(this.$state.params.username)
          .then( user => {
            this.profileUser = user;
            this.isLoading = false;
          })
          .catch( err => {
            this.isLoading = false;

            if (404 === err.status) {
              return this.$state.go('weco.notfound');
            }
            else {
              this.AlertsService.push('error', 'Unable to fetch user.');
              this.$state.go('weco.home');
            }
          })
          .then(this.$timeout);
      }
    };

    const init = _ => {
      if (!this.$state.current.name.includes('weco.profile')) return;
      
      if (this.UserService.isAuthenticated() && this.UserService.user.username === this.$state.params.username) {
        this.$timeout( _ => {
          this.profileUser = this.UserService.user;

          if (this.UserService.user.username === this.$state.params.username) {
            if (!this.tabItems.includes('settings') && !this.tabStates.includes('weco.profile.settings')) {
              this.tabItems.push('settings');
              this.tabStates.push('weco.profile.settings');
            }

            if (!this.tabItems.includes('notifications') && !this.tabStates.includes('weco.profile.notifications')) {
              this.tabItems.push('notifications');
              this.tabStates.push('weco.profile.notifications');
            }
          }
        });
      }
      else {
        loadOtherUser();
      }
    };

    init();

    let listeners = [];

    listeners.push(this.EventService.on(this.EventService.events.CHANGE_USER, init));

    this.$scope.$on('$destroy', _ => listeners.forEach( deregisterListener => deregisterListener() ));
  }

  openCoverPictureModal () {
    this.ModalService.open('UPLOAD_IMAGE', {
        route: 'user/me/',
        type: 'cover'
      },
      'Successfully updated cover picture.',
      'Unable to update cover picture.');
  }

  openProfilePictureModal () {
    this.ModalService.open('UPLOAD_IMAGE', {
        route: 'user/me/',
        type: 'picture'
      },
      'Successfully updated profile picture.',
      'Unable to update profile picture.');
  }
}

ProfileController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'AlertsService',
  'AppService',
  'EventService',
  'ModalService',
  'UserService'
];

export default ProfileController;