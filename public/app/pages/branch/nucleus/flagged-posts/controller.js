import Constants from 'config/constants';
import Injectable from 'utils/injectable';

const {
  Category,
  Flag,
  Point,
  Time,
} = Constants.Filters;

class BranchNucleusFlaggedPostsController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusFlaggedPostsController.$inject, injections);

    this.callbackDropdown = this.callbackDropdown.bind(this);
    this.getPosts = this.getPosts.bind(this);
    this.getPostsCb = this.getPostsCb.bind(this);
    this.setDefaultControls = this.setDefaultControls.bind(this);

    this.isLoading = false;
    this.isLoadingMore = false;
    // To stop sending requests once we hit the bottom of posts.
    this.lastFetchedPostId = false;
    this.posts = [];

    this.controls = {
      postType: {
        items: Category,
        selectedIndex: -1,
        title: 'category',
      },
      sortBy: {
        items: Flag,
        selectedIndex: -1,
        title: 'sorted by',
      },
      statType: {
        items: Point,
        selectedIndex: 0,
        title: 'point type',
      },
      timeRange: {
        items: Time,
        selectedIndex: -1,
        title: 'flags from',
      },
    };
    this.setDefaultControls();

    const ctrls = this.controls;
    const {
      attachFilterListeners,
      getFilterFlatItems,
    } = this.UrlService;

    this.postType = getFilterFlatItems(ctrls.postType);
    this.sortBy = getFilterFlatItems(ctrls.sortBy);
    this.statType = getFilterFlatItems(ctrls.statType);
    this.timeRange = getFilterFlatItems(ctrls.timeRange);

    const { events } = this.EventService;
    const listeners = [
      ...attachFilterListeners(this.$scope, ctrls, this.callbackDropdown),
      this.EventService.on(events.CHANGE_BRANCH_PREFETCH, this.callbackDropdown),
      this.EventService.on(events.CHANGE_BRANCH_PREFETCH, this.setDefaultControls),
      this.EventService.on(events.SCROLLED_TO_BOTTOM, this.getPostsCb),
    ];
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  callbackDropdown() {
    const { applyFilter } = this.UrlService;
    const {
      postType,
      sortBy,
      timeRange,
    } = this.controls;

    applyFilter(sortBy, 'sort');
    applyFilter(timeRange, 'time');
    applyFilter(postType, 'type');

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
      const timeafter = this.getTimeRange();

      // fetch the posts for this branch and timefilter
      return this.BranchService
        .getPosts(id, timeafter, sortBy, statType, postType, lastPostId, true)
        .then(newPosts => this.$timeout(() => {
          // If lastPostId was specified, we are fetching more posts, so append them.
          posts = lastPostId ? posts.concat(newPosts) : newPosts;
          this.posts = posts;

          // 30 is the length of the posts response sent back by server.
          if (newPosts.length > 0 && newPosts.length < 30) {
            this.lastFetchedPostId = newPosts[newPosts.length - 1].id;
          }

          this.isLoading = false;
          this.isLoadingMore = false;
          return resolve();
        }))
        .catch(() => this.$timeout(() => {
          this.AlertsService.push('error', 'Error fetching posts.');
          this.isLoading = false;
          this.isLoadingMore = false;
          return reject();
        }));
    });
  }

  getPostsCb() {
    if (!this.isLoadingMore) {
      this.isLoadingMore = true;
      this.getPosts(this.posts[this.posts.length - 1].id);
    }
  }

  getPostType() {
    return this.UrlService.getFilterItemParam(this.controls.postType, 'type');
  }

  getSortBy() {
    return this.UrlService.getFilterItemParam(this.controls.sortBy, 'sort-flag');
  }

  getStatType() {
    return this.UrlService.getFilterItemParam(this.controls.statType, 'stat');
  }

  getTimeRange() {
    return this.UrlService.getFilterItemParam(this.controls.timeRange, 'time');
  }

  setDefaultControls() {
    const {
      postType,
      sortBy,
      statType,
      timeRange,
    } = this.controls;
    const {
      getUrlSearchParams,
      urlToFilterItemIndex,
    } = this.UrlService;
    const {
      sort,
      stat,
      time,
      type,
    } = getUrlSearchParams();
    const defaultPostTypeIndex = 0;
    const defaultSortByIndex = 0;
    const defaultStatTypeIndex = 0;
    const defaultTimeRangeIndex = 0;

    const urlIndexPostType = urlToFilterItemIndex(type, postType);
    const urlIndexSortBy = urlToFilterItemIndex(sort, sortBy);
    const urlIndexStatType = urlToFilterItemIndex(stat, statType);
    const urlIndexTimeRange = urlToFilterItemIndex(time, timeRange);

    postType.selectedIndex = urlIndexPostType !== -1 ? urlIndexPostType : defaultPostTypeIndex;
    sortBy.selectedIndex = urlIndexSortBy !== -1 ? urlIndexSortBy : defaultSortByIndex;
    statType.selectedIndex = urlIndexStatType !== -1 ? urlIndexStatType : defaultStatTypeIndex;
    timeRange.selectedIndex = urlIndexTimeRange !== -1 ? urlIndexTimeRange : defaultTimeRangeIndex;

    // Set filters through service for other modules.
    setTimeout(() => {
      this.callbackDropdown();
    }, 0);
  }
}

BranchNucleusFlaggedPostsController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'AlertsService',
  'BranchService',
  'EventService',
  'UrlService',
];

export default BranchNucleusFlaggedPostsController;
