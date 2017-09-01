import Injectable from 'utils/injectable';

class BranchWallController extends Injectable {
  constructor(...injections) {
    super(BranchWallController.$inject, injections);

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
          'total points',
          '# of comments',
          'date posted',
        ],
        selectedIndex: 2,
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
    this.lastRequest = {
      id: undefined,
      lastId: undefined,
      postType: undefined,
      sortBy: undefined,
      statType: undefined,
      timeAfter: undefined,
    };
    this.posts = [];

    this.callbackDropdown = this.callbackDropdown.bind(this);
    this.callbackScroll = this.callbackScroll.bind(this);
    this.getPosts = this.getPosts.bind(this);
    this.getPostType = this.getPostType.bind(this);
    this.getSortBy = this.getSortBy.bind(this);
    this.getStatType = this.getStatType.bind(this);
    this.getTimeAfter = this.getTimeAfter.bind(this);

    // Do the initial load so the loader appears straight away.
    this.getPosts();

    const listeners = [];
    listeners.push(this.$rootScope.$watch(() => this.controls.postType.selectedIndex, this.callbackDropdown));
    listeners.push(this.$rootScope.$watch(() => this.controls.sortBy.selectedIndex, this.callbackDropdown));
    listeners.push(this.$rootScope.$watch(() => this.controls.statType.selectedIndex, this.callbackDropdown));
    listeners.push(this.$rootScope.$watch(() => this.controls.timeRange.selectedIndex, this.callbackDropdown));
    listeners.push(this.EventService.on(this.EventService.events.CHANGE_BRANCH_PREFETCH, () => this.getPosts()));
    listeners.push(this.EventService.on(this.EventService.events.SCROLLED_TO_BOTTOM, this.callbackScroll));
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  callbackDropdown(newValue, oldValue) {
    if (newValue !== oldValue) this.getPosts();
  }

  callbackScroll(name) {
    const items = this.posts.length;
    if (name === 'WallScrollToBottom' && items > 0) {
      this.getPosts(this.posts[items - 1].id);
    }
  }

  // Return the correct ui-sref string.
  getLink(post) {
    const correctUiSrefForTypes = [
      'poll',
      'text',
    ];
    const postid = post.id;

    if (correctUiSrefForTypes.includes(post.type)) {
      return this.$state.href('weco.branch.post', { postid });
    }

    return post.text;
  }

  getPosts(lastId) {
    if (this.isLoading === true || !this.$state.current.name.includes('weco.branch.wall')) {
      return;
    }

    const id = this.$state.params.branchid;
    const lr = this.lastRequest;
    const postType = this.getPostType();
    const sortBy = this.getSortBy();
    const statType = this.getStatType();
    const timeAfter = this.getTimeAfter();

    // Don't send the request if nothing changed.
    if (lr.id === id && lr.lastId === lastId &&
      lr.postType === postType && lr.sortBy === sortBy &&
      lr.statType === statType && lr.timeAfter === timeAfter) {
      return;
    }

    // Update the last request values to compare with the next call.
    this.lastRequest.id = id;
    this.lastRequest.lastId = lastId;
    this.lastRequest.postType = postType;
    this.lastRequest.sortBy = sortBy;
    this.lastRequest.statType = statType;
    this.lastRequest.timeAfter = timeAfter;

    this.isLoading = true;

    this.BranchService.getPosts(id, timeAfter, sortBy, statType, postType, lastId, false)
      .then(newPosts => this.$timeout(() => {
        // If lastId was specified, we are fetching more posts, so append them.
        const posts = lastId ? this.posts.concat(newPosts) : newPosts;
        this.posts = posts;

        // 30 is the length of the posts response sent back by server.
        if (newPosts.length > 0 && newPosts.length < 30) {
          this.lastFetchedPostId = newPosts[newPosts.length - 1].id;
        }

        this.isLoading = false;
      }))
      .catch(() => {
        this.AlertsService.push('error', 'Error fetching posts.');
        this.isLoading = false;
      });
  }

  getPostType() {
    const key = this.controls.postType.items[this.controls.postType.selectedIndex];

    switch(key.toLowerCase()) {
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
    switch(this.controls.sortBy.items[this.controls.sortBy.selectedIndex].toLowerCase()) {
      case 'total points':
        return 'points';

      case 'date posted':
        return 'date';

      case '# of comments':
        return 'comment_count';

      default:
        return 'points';
    }
  }

  getStatType() {
    const key = this.controls.statType.items[this.controls.statType.selectedIndex];

    switch(key.toLowerCase()) {
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

  getTimeAfter() {
    switch(this.controls.timeRange.items[this.controls.timeRange.selectedIndex].toLowerCase()) {
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

BranchWallController.$inject = [
  '$rootScope',
  '$scope',
  '$state',
  '$timeout',
  'AlertsService',
  'AppService',
  'BranchService',
  'EventService',
  'WallService',
];

export default BranchWallController;
