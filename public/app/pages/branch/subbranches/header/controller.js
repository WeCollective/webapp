import Injectable from 'utils/injectable';

class BranchSubbranchesHeaderController extends Injectable {
  constructor(...injections) {
    super(BranchSubbranchesHeaderController.$inject, injections);

    this.controls = {
      sortBy: {
        items: [{
          label: 'total points',
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
        title: 'sort by',
      },
      timeRange: {
        items: [{
          label: 'all time',
          url: 'all',
        }, {
          label: 'past year',
          url: 'year',
        }, {
          label: 'past month',
          url: 'month',
        }, {
          label: 'past week',
          url: 'week',
        }, {
          label: 'past 24 hrs',
          url: 'day',
        }, {
          label: 'past hour',
          url: 'hour',
        }],
        selectedIndex: -1,
        title: 'time range',
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
    switch (sortBy.items[sortBy.selectedIndex].label.toLowerCase()) {
      case 'total points':
        return 'post_points';

      case '# of posts':
        return 'post_count';

      case '# of comments':
        return 'post_comments';

      case 'date created':
      default:
        return 'date';
    }
  }

  getTimeRange() {
    const { timeRange } = this.controls;
    switch (timeRange.items[timeRange.selectedIndex].label.toLowerCase()) {
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
