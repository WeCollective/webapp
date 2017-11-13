import Injectable from 'utils/injectable';

class ProfileController extends Injectable {
  constructor(...injections) {
    super(ProfileController.$inject, injections);

    this.isLoading = false;
    this.profileUser = {};
    this.run = 0;
    this.showCover = true;
    this.showLoader = false;
    this.state = this.getInitialState();

    this.renderTabs(true);

    this.renderTabs = this.renderTabs.bind(this);

    const listeners = [];

    listeners.push(this.EventService.on(this.EventService.events.CHANGE_USER, this.renderTabs));

    listeners.push(this.EventService.on(this.EventService.events.LOADING_ACTIVE, () => {
      this.showLoader = true;
    }));

    listeners.push(this.EventService.on(this.EventService.events.LOADING_INACTIVE, () => {
      this.showLoader = false;
    }));

    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  getInitialState() {
    return {
      tabItems: [
        'about',
      ],
      tabStates: [
        'weco.profile.about',
      ],
    };
  }

  getUser(username) {
    this.isLoading = true;

    this.UserService.fetch(username)
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

  markAllNotificationsAsSeen() {
    this.UserService.markAllNotifications(this.UserService.user.username)
      .then(() => this.EventService.emit('MARK_ALL_NOTIFICATIONS_READ'))
      .catch(() => this.AlertsService.push('error', 'Unable to mark all notifications as read.'));
  }

  openCoverPictureModal() {
    this.ModalService.open('UPLOAD_IMAGE', {
        route: 'user/me/',
        type: 'cover',
      },
      'Successfully updated cover picture.',
      'Unable to update cover picture.');
  }

  openProfilePictureModal() {
    this.ModalService.open('UPLOAD_IMAGE', {
        route: 'user/me/',
        type: 'picture',
      },
      'Successfully updated profile picture.',
      'Unable to update profile picture.');
  }

  renderTabs(fromConstructor) {
    const publicAccessStates = this.getInitialState().tabStates;
    const state = this.$state.current.name;
    const username = this.$state.params.username;

    if (!fromConstructor) {
      this.run += 1;
    }

    if (!state.includes('weco.profile')) return;

    const newState = this.getInitialState();

    // Add user tabs.
    if (this.UserService.user.username === username) {
      // Settings.
      newState.tabItems.push('settings');
      newState.tabStates.push('weco.profile.settings');

      // Notifications.
      newState.tabItems.push('notifications');
      newState.tabStates.push('weco.profile.notifications');
    }

    // Display the viewed user's profile.
    if (this.UserService.isAuthenticated() && this.UserService.user.username === username) {
      this.profileUser = this.UserService.user;
    }
    else if (!publicAccessStates.includes(state) && !fromConstructor) {
      if (this.run === 1 &&
        Object.keys(this.UserService.user).length > 0 &&
        this.UserService.user.username === username) return;

      this.$state.go('weco.profile.about', { username });

      if (this.UserService.user.username !== username) {
        this.getUser(username);
      }
    }
    else if (this.UserService.user.username !== username) {
      this.getUser(username);
    }

    this.state = newState;
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
  'UserService',
];

export default ProfileController;
