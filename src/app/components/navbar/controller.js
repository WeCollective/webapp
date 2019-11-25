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
        this.results = this.SearchService.getResults(true);

        this.getNotifications();

        const { events } = this.EventService;
        const listeners = [];
        listeners.push(this.EventService.on(events.CHANGE_USER, this.getNotifications));
        listeners.push(this.EventService.on(events.UNREAD_NOTIFICATION_CHANGE, this.updateCount));
        listeners.push(this.EventService.on(events.MARK_ALL_NOTIFICATIONS_READ, this.updateCount));

        listeners.push(this.EventService.on(events.SEARCH, () => this.handleSearch()));
        listeners.push(this.$scope.$watch(() => this.query, q => {
            var searchPosts = document.getElementById("search-posts");
            //if posts are visible search the posts
            if (searchPosts.style.display == "block") {
                this.SearchService.searchPosts(q, true);
            } else {
                //otherwise the search branches is visible, search branches
                this.SearchService.searchBranches(q, "root", true);
            }

            if (q == '') {
                this.clearQuery();
                this.SearchService.clear(true);
            }
        }));

        listeners.push(this.EventService.on(events.STATE_CHANGE_SUCCESS, () => {
            this.clearQuery();
            this.isMobileSearchActive = false;
        }));
        this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));

        this.listClassToNotHideSearch = "not-hide";

        document.getElementById("search-res").style.display = "none";
        this.$window.addEventListener("click", (e) => {
            //check if clicked outside of search
            if (!e.target.classList.contains(this.listClassToNotHideSearch)) {
                document.getElementById("search-res").style.display = "none";
            }
        });



    }

    cacheNotifications() {
        const cache = this.LocalStorageService.getObject('cache');
        cache.notifications = cache.notifications || {};
        cache.notifications.count = this.notificationCount;
        this.LocalStorageService.setObject('cache', cache);
    }

    showres() {
        if (this.results.length > 0)
            document.getElementById("search-res").style.display = "block";
        else
            document.getElementById("search-res").style.display = "none";
    }

    clearQuery() {
        this.query = '';
        this.results = [];

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

    search(query) {
        document.getElementById("search-res").style.display = "none";

        var searchPosts = document.getElementById("search-posts");
        var target;
        //if posts are visible search the posts
        if (searchPosts.style.display == "block") {
            //get current branch and search inside
            var target = this.$state.href('weco.branch.wall', { branchid: "root", query: query });
        } else {
            //otherwise the search branches is visible, search branches
            //get current branch and search inside
            var target = this.$state.href('weco.branch.subbranches', { branchid: "root", query: query });
        }

        if (!target) return;
        this.clearQuery();
        this.$location.url(target);

    }

    /*
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
        */

    handleKeyPress(event) {

        const { which } = event;

        switch (which) {
            // Enter.
            case 13:
                {
                    if (!this.query) {
                        return;
                    } else {
                        this.search(this.query);
                        break;
                    }
                }

                // Escape.
            case 27:
                {
                    document.getElementById("search-res").style.display = "none";
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
                this.showres();
                break;
        }
    }

    handleSearch() {
        this.results = this.SearchService.getResults(true);
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

    toggleGlobalSearchFilter() {
        var searchBranches = document.getElementById("search-branches");
        var searchPosts = document.getElementById("search-posts");

        if (searchPosts.style.display == "block") {
            searchPosts.style.display = "none";
        } else {
            searchPosts.style.display = "block";
        };

        if (searchBranches.style.display == "none") {
            searchBranches.style.display = "block";
        } else {
            searchBranches.style.display = "none";
        };
        this.results = [];
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
    'UrlService',
    'AlertsService',
    'AppService',
    'EventService',
    'LocalStorageService',
    'SearchService',
    'UserService',
    'BranchService',
];

export default NavbarController;