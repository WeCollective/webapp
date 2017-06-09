import Injectable from 'utils/injectable';

class ProfileController extends Injectable {
  constructor(...injections) {
    super(ProfileController.$inject, injections);

    this.isLoading = false;
    this.profileUser = {};
    this.showCover = true;
    this.tabItems = ['about'];
    this.tabStates = ['weco.profile.about'];

    this.init = this.init.bind(this);
    this.loadOtherUser = this.loadOtherUser.bind(this);

    this.init();

    let listeners = [];

    listeners.push(this.EventService.on(this.EventService.events.CHANGE_USER, this.init));

    this.$scope.$on('$destroy', _ => listeners.forEach(deregisterListener => deregisterListener()));
  }

  init () {
    if (!this.$state.current.name.includes('weco.profile')) return;
    
    if (this.UserService.isAuthenticated() && this.UserService.user.username === this.$state.params.username) {
      this.$timeout(_ => {
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
      this.loadOtherUser();
    }
  }

  loadOtherUser () {
    if (this.$state.current.name !== 'weco.profile.about') {
      this.$state.go('weco.profile.about', { username: this.$state.params.username }).then(this.init);
      return;
    }

    this.isLoading = true;
    this.UserService.fetch(this.$state.params.username)
      .then(user => {
        this.profileUser = user;
        this.isLoading = false;
      })
      .catch(err => {
        this.isLoading = false;

        if (err.status === 404) {
          return this.$state.go('weco.notfound');
        }
        else {
          this.AlertsService.push('error', 'Unable to fetch user.');
          this.$state.go('weco.home');
        }
      })
      .then(this.$timeout);
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
