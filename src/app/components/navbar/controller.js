import Injectable from 'utils/injectable';

class NavbarController extends Injectable {
    constructor(...injections) {
        super(NavbarController.$inject, injections);

        this.getNotifications = this.getNotifications.bind(this);
        this.updateCount = this.updateCount.bind(this);

        const cache = this.LocalStorageService.getObject('cache').notifications || {};

        this.animationSrc = '';
        this.highlightResult = -1;
        this.highlightResultObj = {};
        this.isMobileSearchActive = false;
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
        listeners.push(this.$scope.$watch(() => this.query, q => this.SearchService.searchBranches(q)));
        listeners.push(this.EventService.on(events.STATE_CHANGE_SUCCESS, () => {
            this.clearQuery();
            this.isMobileSearchActive = false;
        }));
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
        const { username } = this.UserService.user;

        if (!username) return;

        this.UserService.getNotifications(username, true)
            .then(count => {
                this.notificationCount = count;

                const cache = this.LocalStorageService.getObject('cache');
                cache.notifications = cache.notifications || {};
                cache.notifications.count = this.notificationCount;
                this.LocalStorageService.setObject('cache', cache);

                // Sometimes the notifications badge would not get updated.
                this.$scope.$apply();
            })
            .catch(err => {
                console.log(err);
                this.AlertsService.push('error', 'Unable to fetch notifications.');
            });
    }

    getSearchNode() {
        return document.getElementsByClassName('nav__search-text')[0];
    }

    getSearchResultTarget(result) {
        const {
            id,
            type,
        } = result;
        let tp = type;
        tp = "branch";
        switch (tp) {
            case 'branch':
                //go to branch
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
            case 13:
                {
                    if (this.highlightResult === -1) return;
                    const target = this.getSearchResultTarget(this.results[this.highlightResult]);
                    this.$location.url(target);
                    break;
                }

                // Escape.
            case 27:
                {
                    const input = this.getSearchNode();
                    if (input) input.blur();
                    break;
                }

                // Arrow up.
            case 38:
                {
                    event.preventDefault();
                    if (this.highlightResult > 0) {
                        this.highlightResult -= 1;
                    } else {
                        this.highlightResult = this.results.length - 1;
                    }
                    this.highlightResultObj = this.results[this.highlightResult];
                    break;
                }

                // Arrow down.
            case 40:
                {
                    event.preventDefault();
                    if (this.highlightResult + 1 < this.results.length) {
                        this.highlightResult += 1;
                    } else {
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
        const { name } = this.$state.current;
        const { branchid } = this.$state.params;
        return name.includes(control) && branchid === 'root';
    }

    logout() {
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

    toggleMobileSearch(forceValue) {
        this.isMobileSearchActive = forceValue !== undefined ? forceValue : !this.isMobileSearchActive;
        if (forceValue) {
            const input = this.getSearchNode();
            if (input) this.$timeout(() => input.focus(), 50);
        }
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
        } else {
            this.notificationCount += delta;
        }
        this.cacheNotifications();
    }

    openLeftModal() {
        var leftModal = document.getElementsByClassName("nav-bar-left-dropdown-modal-wrapper")[0];
        leftModal.style.display = "block";
    }

    closeLeftModal() {
        var leftModal = document.getElementsByClassName("nav-bar-left-dropdown-modal-wrapper")[0];
        leftModal.style.display = "none";
    }

    openRightModal() {
        var rightModal = document.getElementsByClassName("nav-bar-right-dropdown-modal-wrapper")[0];
        rightModal.style.display = "block";
    }

    closeRightModal() {
        var rightModal = document.getElementsByClassName("nav-bar-right-dropdown-modal-wrapper")[0];
        rightModal.style.display = "none";
    }

    openLoginModal() {
        var loginModal = document.getElementsByClassName("auth-modal-wrapper")[0];
        loginModal.style.display = "block";
    }

    closeLoginModal() {
        var loginModal = document.getElementsByClassName("auth-modal-wrapper")[0];
        loginModal.style.display = "none";
    }

    submit() {
        this.isLoading = true;
        this.credentials.username = this.credentials.username.toLowerCase();

        if (this.isLoginForm()) {
            this.login();
        } else {
            this.signup();
        }
    }
}

NavbarController.$inject = [
    '$location',
    '$scope',
    '$window',
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