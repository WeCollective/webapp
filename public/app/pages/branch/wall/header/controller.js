import Injectable from 'utils/injectable';

class BranchWallHeaderController extends Injectable {
  constructor(...injections) {
    super(BranchWallHeaderController.$inject, injections);

    this.controls = {
      postType: {
        items: [{
          label: 'all',
          url: 'all',
        }, {
          label: 'images',
          url: 'image',
        }, {
          label: 'videos',
          url: 'video',
        }, {
          label: 'audio',
          url: 'audio',
        }, {
          label: 'text',
          url: 'text',
        }, {
          label: 'pages',
          url: 'page',
        }, {
          label: 'polls',
          url: 'poll',
        }],
        selectedIndex: -1,
        title: 'category',
      },
      sortBy: {
        items: [{
          label: 'points',
          url: 'points',
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
      statType: {
        items: [{
          label: 'global',
          url: 'global',
        }, {
          label: 'local',
          url: 'local',
        }, {
          label: 'branch',
          url: 'branch',
        }],
        selectedIndex: -1,
        title: 'point type',
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
        title: 'posts from',
      },
    };
    this.postType = this.controls.postType.items.map(x => x.label);
    this.sortBy = this.controls.sortBy.items.map(x => x.label);
    this.statType = this.controls.statType.items.map(x => x.label);
    this.timeRange = this.controls.timeRange.items.map(x => x.label);

    this.callbackDropdown = this.callbackDropdown.bind(this);
    this.setDefaultControls = this.setDefaultControls.bind(this);
    // this.setDefaultControls();

    const ctrls = this.controls;
    const { events } = this.EventService;
    this.initialized = false;
    const listeners = [
      this.$scope.$watch(() => ctrls.postType.selectedIndex, this.callbackDropdown),
      this.$scope.$watch(() => ctrls.sortBy.selectedIndex, this.callbackDropdown),
      this.$scope.$watch(() => ctrls.statType.selectedIndex, this.callbackDropdown),
      this.$scope.$watch(() => ctrls.timeRange.selectedIndex, this.callbackDropdown),
      this.EventService.on(events.CHANGE_BRANCH, () => this.setDefaultControls()),
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
    const {
      postType,
      sortBy,
      statType,
      timeRange,
    } = this.controls;

    if (sortBy.selectedIndex !== -1) {
      this.$location.search('sort', sortBy.items[sortBy.selectedIndex].url);
    }

    if (statType.selectedIndex !== -1) {
      this.$location.search('stat', statType.items[statType.selectedIndex].url);
    }

    if (timeRange.selectedIndex !== -1) {
      this.$location.search('time', timeRange.items[timeRange.selectedIndex].url);
    }

    if (postType.selectedIndex !== -1) {
      this.$location.search('type', postType.items[postType.selectedIndex].url);
    }
  }

  getPostType() {
    const { postType } = this.controls;
    if (postType.selectedIndex === -1) return null;
    return postType.items[postType.selectedIndex].url;
  }

  getSortBy() {
    const { sortBy } = this.controls;
    if (sortBy.selectedIndex === -1) return null;
    switch (sortBy.items[sortBy.selectedIndex].url) {
      case 'comments':
        return 'comment_count';

      case 'date':
        return 'date';

      case 'points':
      default:
        return 'points';
    }
  }

  getStatType() {
    const { statType } = this.controls;
    if (statType.selectedIndex === -1) return null;
    const { url } = statType.items[statType.selectedIndex];
    switch (url) {
      case 'global':
        return 'global';

      case 'local':
        return 'local';

      case 'branch':
        return 'individual';

      default:
        return url;
    }
  }

  getTimeRange() {
    const { timeRange } = this.controls;
    if (timeRange.selectedIndex === -1) return null;
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
    const { branch } = this.BranchService;
    const defaultPostTypeIndex = 0;
    const defaultSortByIndex = branch.id === 'root' ? 0 : 2;
    const defaultStatTypeIndex = 0;
    const defaultTimeRangeIndex = branch.id === 'root' ? 3 : 0;

    const {
      postType,
      sortBy,
      statType,
      timeRange,
    } = this.controls;

    const urlIndexPostType = this.urlToItemIndex(query.type, postType.items);
    const urlIndexSortBy = this.urlToItemIndex(query.sort, sortBy.items);
    const urlIndexStatType = this.urlToItemIndex(query.stat, statType.items);
    const urlIndexTimeRange = this.urlToItemIndex(query.time, timeRange.items);

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

BranchWallHeaderController.$inject = [
  '$location',
  '$scope',
  'BranchService',
  'EventService',
  'HeaderService',
  'WallService',
];

export default BranchWallHeaderController;
