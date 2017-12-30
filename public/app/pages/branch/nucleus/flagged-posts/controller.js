import Injectable from 'utils/injectable';

class BranchNucleusFlaggedPostsController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusFlaggedPostsController.$inject, injections);

    const cache = this.LocalStorageService.getObject('cache').branchNucleusFlaggedPosts || {};

    this.controls = {
      postType: {
        items: [
          'all',
          'images',
          'videos',
          'audio',
          'text',
          'pages',
          'polls',
        ],
        selectedIndex: 0,
      },
      sortBy: {
        items: [
          'date',
          'against branch rules',
          'against site rules',
          'wrong post type',
          'nsfw flags',
        ],
        selectedIndex: 0,
      },
      statType: {
        items: [
          'global',
          'local',
          'branch',
        ],
        selectedIndex: 0,
      },
      timeRange: {
        items: [
          'all time',
          'past year',
          'past month',
          'past week',
          'past 24 hrs',
          'past hour',
        ],
        selectedIndex: 0,
      },
    };
    this.isLoading = false;
    this.isLoadingMore = false;
    // To stop sending requests once we hit the bottom of posts.
    this.lastFetchedPostId = false;
    this.posts = cache[this.BranchService.branch.id] || [];

    this.cb = this.cb.bind(this);
    this.getPosts = this.getPosts.bind(this);
    this.getPostsCb = this.getPostsCb.bind(this);
    this.getPostType = this.getPostType.bind(this);
    this.getSortBy = this.getSortBy.bind(this);
    this.getStatType = this.getStatType.bind(this);
    this.getTimeafter = this.getTimeafter.bind(this);

    const {
      postType,
      sortBy,
      timeRange,
    } = this.controls;
    const { events } = this.EventService;
    const listeners = [];

    listeners.push(this.$rootScope.$watch(() => postType.selectedIndex, (newValue, oldValue) => {
      if (newValue !== oldValue) this.cb();
    }));

    listeners.push(this.$rootScope.$watch(() => sortBy.selectedIndex, (newValue, oldValue) => {
      if (newValue !== oldValue) this.cb();
    }));

    listeners.push(this.$rootScope.$watch(() => timeRange.selectedIndex, (newValue, oldValue) => {
      if (newValue !== oldValue) this.cb();
    }));

    listeners.push(this.EventService.on(events.CHANGE_BRANCH, this.cb));
    listeners.push(this.EventService.on(events.SCROLLED_TO_BOTTOM, this.getPostsCb));
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  cb() {
    return new Promise((resolve, reject) => {
      if (!this.$state.current.name.includes('weco.branch.nucleus') ||
        Object.keys(this.BranchService.branch).length < 2) {
        return reject();
      }

      return this.getPosts();
    });
  }

  getPosts(lastPostId) {
    return new Promise((resolve, reject) => {
      let { posts } = this;

      if (this.isLoading === true || lastPostId === this.lastFetchedPostId) {
        return resolve();
      }

      this.isLoading = true;

      if (lastPostId) {
        this.lastFetchedPostId = lastPostId;
      }

      const { id } = this.BranchService.branch;
      const postType = this.getPostType();
      const sortBy = this.getSortBy();
      const statType = this.getStatType();
      const timeafter = this.getTimeafter();

      // fetch the posts for this branch and timefilter
      return this.BranchService
        .getPosts(id, timeafter, sortBy, statType, postType, lastPostId, true)
        .then(newPosts => {
          this.$timeout(() => {
            // If lastPostId was specified, we are fetching more posts, so append them.
            posts = lastPostId ? posts.concat(newPosts) : newPosts;
            this.posts = posts;

            // 30 is the length of the posts response sent back by server.
            if (newPosts.length > 0 && newPosts.length < 30) {
              this.lastFetchedPostId = newPosts[newPosts.length - 1].id;
            }

            const cache = this.LocalStorageService.getObject('cache');
            cache.branchNucleusFlaggedPosts = cache.branchNucleusFlaggedPosts || {};
            cache.branchNucleusFlaggedPosts[this.BranchService.branch.id] = this.posts.slice(0, 30);
            this.LocalStorageService.setObject('cache', cache);

            this.isLoading = false;
            this.isLoadingMore = false;
            return resolve();
          });
        })
        .catch(() => {
          this.AlertsService.push('error', 'Error fetching posts.');
          this.isLoading = false;
          this.isLoadingMore = false;
          return reject();
        });
    });
  }

  getPostsCb() {
    if (!this.isLoadingMore) {
      this.isLoadingMore = true;
      this.getPosts(this.posts[this.posts.length - 1].id);
    }
  }

  getPostType() {
    const { postType } = this.controls;
    const key = postType.items[postType.selectedIndex];
    switch (key.toLowerCase()) {
      case 'images':
        return 'image';

      case 'videos':
        return 'video';

      case 'pages':
        return 'page';

      case 'polls':
        return 'poll';

      default:
        return key;
    }
  }

  getSortBy() {
    const { sortBy } = this.controls;
    const key = sortBy.items[sortBy.selectedIndex];
    switch (key.toLowerCase()) {
      case 'date':
        return 'date';

      case 'against branch rules':
        return 'branch_rules';

      case 'against site rules':
        return 'site_rules';

      case 'wrong post type':
        return 'wrong_type';

      case 'nsfw flags':
        return 'nsfw';

      default:
        return 'date';
    }
  }

  getStatType() {
    const { statType } = this.controls;
    const key = statType.items[statType.selectedIndex];
    switch (key.toLowerCase()) {
      case 'global':
        return 'global';

      case 'local':
        return 'local';

      case 'branch':
        return 'individual';

      default:
        return key;
    }
  }

  // compute the appropriate timeafter for the selected time filter
  getTimeafter() {
    const { timeRange } = this.controls;
    switch (timeRange.items[timeRange.selectedIndex].toLowerCase()) {
      case 'past year':
        return new Date().setFullYear(new Date().getFullYear() - 1);

      case 'past month':
        return new Date().setMonth(new Date().getMonth() - 1);

      case 'past week':
        return new Date().setDate(new Date().getDate() - 7);

      case 'past 24 hrs':
        return new Date().setDate(new Date().getDate() - 1);

      case 'past hour':
        return new Date().setHours(new Date().getHours() - 1);

      case 'all time':
      default:
        return 0;
    }
  }
}

BranchNucleusFlaggedPostsController.$inject = [
  '$rootScope',
  '$scope',
  '$state',
  '$timeout',
  'AlertsService',
  'BranchService',
  'EventService',
  'LocalStorageService',
];

export default BranchNucleusFlaggedPostsController;
