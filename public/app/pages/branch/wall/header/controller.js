import Constants from 'config/constants';
import Injectable from 'utils/injectable';

const {
  Category,
  Point,
  SortPost,
  Time,
} = Constants.Filters;

class BranchWallHeaderController extends Injectable {
  constructor(...injections) {
    super(BranchWallHeaderController.$inject, injections);

    this.callbackDropdown = this.callbackDropdown.bind(this);
    this.setDefaultControls = this.setDefaultControls.bind(this);

    this.controls = {
      postType: {
        items: Category,
        selectedIndex: -1,
        title: 'category',
      },
      sortBy: {
        items: SortPost,
        selectedIndex: -1,
        title: 'sorted by',
      },
      statType: {
        items: Point,
        selectedIndex: -1,
        title: 'point type',
      },
      timeRange: {
        items: Time,
        selectedIndex: -1,
        title: 'posts from',
      },
    };
    this.$timeout(() => this.setDefaultControls());

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
    this.initialized = false;
    const listeners = [
      ...attachFilterListeners(this.$scope, ctrls, this.callbackDropdown),
      this.EventService.on(events.CHANGE_BRANCH_PREFETCH, this.setDefaultControls),
    ];
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  callbackDropdown() {
    if (!this.initialized) return;

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
    } = this.controls;

    applyFilter(sortBy, 'sort');
    applyFilter(statType, 'stat');
    applyFilter(timeRange, 'time');
    applyFilter(postType, 'type');
  }

  getPostType() {
    return this.UrlService.getFilterItemParam(this.controls.postType, 'type');
  }

  getSortBy() {
    return this.UrlService.getFilterItemParam(this.controls.sortBy, 'sort');
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
    const { id } = this.BranchService.branch;
    const defaultPostTypeIndex = 0;
    const defaultSortByIndex = id === 'root' ? 0 : 2;
    const defaultStatTypeIndex = 0;
    const defaultTimeRangeIndex = id === 'root' ? 3 : 0;

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
      this.initialized = true;
      this.callbackDropdown();
    }, 0);
  }
}

BranchWallHeaderController.$inject = [
  '$scope',
  '$timeout',
  'BranchService',
  'EventService',
  'HeaderService',
  'UrlService',
  'WallService',
];

export default BranchWallHeaderController;
