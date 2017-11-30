import Injectable from 'utils/injectable';

class NavbarController extends Injectable {
  constructor(...injections) {
    super(NavbarController.$inject, injections);

    this.getNotifications = this.getNotifications.bind(this);
    this.updateCount = this.updateCount.bind(this);

    const cache = this.LocalStorageService.getObject('cache').notifications || {};

    this.animationSrc = '';
    this.expanded = false;
    this.highlightResult = -1;
    this.highlightResultObj = {};
    this.notificationCount = cache.count || 0;
    this.query = '';
    this.results = this.SearchService.getResults();

    this.getNotifications();

    const { events } = this.EventService;
    const listeners = [];
    listeners.push(this.EventService.on(events.CHANGE_USER, this.getNotifications));
    listeners.push(this.EventService.on(events.SEARCH, () => this.handleSearch()));
    listeners.push(this.EventService.on(events.UNREAD_NOTIFICATION_CHANGE, this.updateCount));
    listeners.push(this.EventService.on(events.MARK_ALL_NOTIFICATIONS_READ, this.updateCount));
    listeners.push(this.$scope.$watch(() => this.query, q => this.SearchService.search(q)));
    listeners.push(this.EventService.on(events.STATE_CHANGE_SUCCESS, () => this.clearQuery()));
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  cacheNotifications() {
    const cache = this.LocalStorageService.getObject('cache');
    cache.notifications = cache.notifications || {};
    cache.notifications.count = this.notificationCount;
    this.LocalStorageService.setObject('cache', cache);
  }

  clearQuery() {
    this.query = '';
  }

  getNotifications() {
    if (!this.UserService.user.username) return;

    this.UserService.getNotifications(this.UserService.user.username, true)
      .then(count => {
        this.notificationCount = count;

        const cache = this.LocalStorageService.getObject('cache');
        cache.notifications = cache.notifications || {};
        cache.notifications.count = this.notificationCount;
        this.LocalStorageService.setObject('cache', cache);

        // Sometimes the notifications badge would not get updated.
        this.$scope.$apply();
      })
      .catch(() => this.AlertsService.push('error', 'Unable to fetch notifications.'));
  }

  getSearchResultTarget(result) {
    const {
      id,
      type,
    } = result;

    switch (type) {
      case 'branch':
        return this.$state.href('weco.branch', {
          branchid: id,
        });

      case 'post':
        return this.$state.href('weco.branch.post', {
          branchid: 'root',
          postid: id,
        });

      case 'user':
        return this.$state.href('weco.profile', {
          username: id,
        });

      default:
        return '';
    }
  }

  handleKeyPress(event) {
    const { which } = event;
    switch (which) {
      // Enter.
      case 13: {
        if (this.highlightResult === -1) return;
        const target = this.getSearchResultTarget(this.results[this.highlightResult]);
        this.$location.url(target);
        break;
      }

      // Arrow up.
      case 38: {
        event.preventDefault();
        if (this.highlightResult > 0) {
          this.highlightResult -= 1;
        }
        else {
          this.highlightResult = this.results.length - 1;
        }
        this.highlightResultObj = this.results[this.highlightResult];
        break;
      }

      // Arrow down.
      case 40: {
        event.preventDefault();
        if (this.highlightResult + 1 < this.results.length) {
          this.highlightResult += 1;
        }
        else {
          this.highlightResult = 0;
        }
        this.highlightResultObj = this.results[this.highlightResult];
        break;
      }

      default:
        // Do nothing.
        break;
    }
  }

  handleSearch() {
    this.results = this.SearchService.getResults();
    if (this.highlightResult === -1) return;

    const {
      id,
      text,
      type,
    } = this.highlightResultObj;
    let hasPreviousMatch = false;

    for (let i = 0; i < this.results.length; i += 1) {
      const result = this.results[i];

      if (text === result.text && type === result.type && id === result.id) {
        hasPreviousMatch = true;
        this.highlightResult = i;
        break;
      }
    }

    if (!hasPreviousMatch) {
      this.highlightResult = -1;
    }
  }

  isControlSelected(control) {
    return this.$state.current.name.includes(control) && this.$state.params.branchid === 'root';
  }

  logout() {
    this.expanded = false;
    this.UserService.logout()
      .then(() => {
        this.$state.go('auth.login');
      })
      .catch(err => {
        console.log(err);
        this.AlertsService.push('error', 'Unable to log out.');
      });
  }

  onHomePage() {
    return this.$state.current.name === 'weco.home';
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
    if (delta === undefined) {
      this.notificationCount = 0;
    }
    else {
      this.notificationCount += delta;
    }
    this.cacheNotifications();
  }
}

NavbarController.$inject = [
  '$location',
  '$scope',
  '$state',
  '$timeout',
  'AlertsService',
  'AppService',
  'EventService',
  'LocalStorageService',
  'SearchService',
  'UserService',
];

export default NavbarController;
