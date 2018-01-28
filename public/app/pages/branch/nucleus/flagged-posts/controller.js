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
    this.getItems = this.getItems.bind(this);
    this.getPostsCb = this.getPostsCb.bind(this);
    this.setDefaultFilters = this.setDefaultFilters.bind(this);

    this.isInit = true;
    this.isWaitingForRequest = false;

    this.PostService.posts = [];

    this.filters = {
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
    this.setDefaultFilters();

    const fltrs = this.filters;
    const {
      attachFilterListeners,
      getFilterFlatItems,
    } = this.UrlService;

    this.postType = getFilterFlatItems(fltrs.postType);
    this.sortBy = getFilterFlatItems(fltrs.sortBy);
    this.statType = getFilterFlatItems(fltrs.statType);
    this.timeRange = getFilterFlatItems(fltrs.timeRange);

    const { events } = this.EventService;
    const listeners = [
      ...attachFilterListeners(this.$scope, fltrs, this.callbackDropdown),
      this.EventService.on(events.CHANGE_FILTER, () => this.getItems()),
      this.EventService.on(events.SCROLLED_TO_BOTTOM, () => this.getPostsCb()),
    ];
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  callbackDropdown() {
    this.HeaderService.setFilters({
      postType: this.getPostType(),
      sortBy: this.getSortBy(),
      statType: this.getStatType(),
      timeRange: this.getTimeRange(),
    });

    const { applyFilter } = this.UrlService;
    const {
      postType,
      sortBy,
      statType,
      timeRange,
    } = this.filters;

    applyFilter(sortBy, 'sort');
    applyFilter(statType, 'stat');
    applyFilter(timeRange, 'time');
    applyFilter(postType, 'type');
  }

  getItems(lastPostId) {
    if (this.isWaitingForRequest === true) return;

    const { id } = this.BranchService.branch;

    this.isWaitingForRequest = true;
    this.PostService.getPosts(id, lastPostId, true)
      .then(() => this.$timeout(() => {
        this.isInit = false;
        this.isWaitingForRequest = false;
      }))
      .catch(() => this.$timeout(() => {
        this.AlertsService.push('error', 'Error fetching posts.');
        this.isInit = false;
        this.isWaitingForRequest = false;
      }));
  }

  getPostsCb() {
    const { posts } = this.PostService;
    this.getItems(posts[posts.length - 1].id);
  }

  getPostType() {
    return this.UrlService.getFilterItemParam(this.filters.postType, 'type');
  }

  getSortBy() {
    return this.UrlService.getFilterItemParam(this.filters.sortBy, 'sort-flag');
  }

  getStatType() {
    return this.UrlService.getFilterItemParam(this.filters.statType, 'stat');
  }

  getTimeRange() {
    return this.UrlService.getFilterItemParam(this.filters.timeRange, 'time');
  }

  setDefaultFilters() {
    const {
      postType,
      sortBy,
      statType,
      timeRange,
    } = this.filters;
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
  'HeaderService',
  'PostService',
  'UrlService',
];

export default BranchNucleusFlaggedPostsController;
