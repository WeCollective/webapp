import Injectable from 'utils/injectable';

class BranchSubbranchesHeaderController extends Injectable {
  constructor(...injections) {
    super(BranchSubbranchesHeaderController.$inject, injections);

    this.controls = {
      sortBy: {
        items: [{
          label: 'points',
          url: 'points',
        }, {
          label: 'posts',
          url: 'posts',
        }, {
          label: 'comments',
          url: 'comments',
        }, {
          label: 'date',
          url: 'date',
        }],
        selectedIndex: -1,
        title: 'sorted by',
      },
      timeRange: {
        items: [{
          label: 'all time',
          url: 'all',
        }, {
          label: 'last year',
          url: 'year',
        }, {
          label: 'last month',
          url: 'month',
        }, {
          label: 'last week',
          url: 'week',
        }, {
          label: 'last 24 hrs',
          url: 'day',
        }, {
          label: 'last hour',
          url: 'hour',
        }],
        selectedIndex: -1,
        title: 'created',
      },
    };
    this.sortBy = this.controls.sortBy.items.map(x => x.label);
    this.timeRange = this.controls.timeRange.items.map(x => x.label);

    this.callbackDropdown = this.callbackDropdown.bind(this);
    this.setDefaultControls = this.setDefaultControls.bind(this);
    this.setDefaultControls();

    const ctrls = this.controls;
    const listeners = [
      this.$scope.$watch(() => ctrls.sortBy.selectedIndex, this.callbackDropdown),
      this.$scope.$watch(() => ctrls.timeRange.selectedIndex, this.callbackDropdown),
    ];
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  callbackDropdown() {
    this.HeaderService.setFilters({
      sortBy: this.getSortBy(),
      timeRange: this.getTimeRange(),
    });
    const {
      sortBy,
      timeRange,
    } = this.controls;
    this.$location.search('sort', sortBy.items[sortBy.selectedIndex].url);
    this.$location.search('time', timeRange.items[timeRange.selectedIndex].url);
  }

  getSortBy() {
    const { sortBy } = this.controls;
    switch (sortBy.items[sortBy.selectedIndex].url) {
      case 'points':
        return 'post_points';

      case 'posts':
        return 'post_count';

      case 'comments':
        return 'post_comments';

      case 'date':
      default:
        return 'date';
    }
  }

  getTimeRange() {
    const { timeRange } = this.controls;
    switch (timeRange.items[timeRange.selectedIndex].url) {
      case 'year':
        return new Date().setFullYear(new Date().getFullYear() - 1);

      case 'month':
        return new Date().setMonth(new Date().getMonth() - 1);

      case 'week':
        return new Date().setDate(new Date().getDate() - 7);

      case 'day':
        return new Date().setDate(new Date().getDate() - 1);

      case 'hour':
        return new Date().setHours(new Date().getHours() - 1);

      case 'all':
      default:
        return 0;
    }
  }

  setDefaultControls() {
    const query = this.$location.search();
    const defaultSortByIndex = 0;
    const defaultTimeRangeIndex = 0;

    const {
      sortBy,
      timeRange,
    } = this.controls;

    const urlIndexSortBy = this.urlToItemIndex(query.sort, sortBy.items);
    const urlIndexTimeRange = this.urlToItemIndex(query.time, timeRange.items);

    sortBy.selectedIndex = urlIndexSortBy !== -1 ? urlIndexSortBy : defaultSortByIndex;
    timeRange.selectedIndex = urlIndexTimeRange !== -1 ? urlIndexTimeRange : defaultTimeRangeIndex;

    // Set filters through service for other modules.
    this.callbackDropdown();
  }

  // Finds the item in array with the matching url value and returns its index.
  urlToItemIndex(str, arr = []) {
    for (let i = 0; i < arr.length; i += 1) {
      if (arr[i].url === str) {
        return i;
      }
    }
    return -1;
  }
}

BranchSubbranchesHeaderController.$inject = [
  '$location',
  '$scope',
  'BranchService',
  'HeaderService',
  'WallService',
];

export default BranchSubbranchesHeaderController;
