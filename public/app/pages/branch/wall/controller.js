import Injectable from 'utils/injectable';

class BranchWallController extends Injectable {
  constructor(...injections) {
    super(BranchWallController.$inject, injections);

    this.isLoading = false;
    this.lastRequest = {
      id: undefined,
      lastId: undefined,
      postType: undefined,
      sortBy: undefined,
      statType: undefined,
      timeRange: undefined,
    };
    this.posts = [];

    this.callbackScroll = this.callbackScroll.bind(this);
    this.getPosts = this.getPosts.bind(this);

    // Do the initial load so the loader appears straight away.
    this.getPosts();

    const { events } = this.EventService;
    const listeners = [];
    listeners.push(this.EventService.on(events.CHANGE_BRANCH_PREFETCH, () => this.getPosts()));
    listeners.push(this.EventService.on(events.CHANGE_FILTER, () => this.getPosts()));
    listeners.push(this.EventService.on(events.SCROLLED_TO_BOTTOM, this.callbackScroll));
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  callbackScroll() {
    const { posts } = this;
    if (posts.length) {
      this.getPosts(posts[posts.length - 1].id);
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

    const filters = this.HeaderService.getFilters();
    const id = this.$state.params.branchid;
    const lr = this.lastRequest;
    const {
      postType,
      sortBy,
      statType,
      timeRange,
    } = filters;

    // Don't send the request if nothing changed.
    if (lr.id === id && lr.lastId === lastId &&
      lr.postType === postType && lr.sortBy === sortBy &&
      lr.statType === statType && lr.timeRange === timeRange) {
      return;
    }

    // Update the last request values to compare with the next call.
    this.lastRequest.id = id;
    this.lastRequest.lastId = lastId;
    this.lastRequest.postType = postType;
    this.lastRequest.sortBy = sortBy;
    this.lastRequest.statType = statType;
    this.lastRequest.timeRange = timeRange;

    this.isLoading = true;
    this.BranchService.getPosts(id, timeRange, sortBy, statType, postType, lastId, false)
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

  getStatType() {
    return this.HeaderService.getFilters().statType;
  }
}

BranchWallController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'AlertsService',
  'BranchService',
  'EventService',
  'HeaderService',
];

export default BranchWallController;
