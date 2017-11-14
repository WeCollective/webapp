import Injectable from 'utils/injectable';

class BranchWallHeaderController extends Injectable {
  constructor(...injections) {
    super(BranchWallHeaderController.$inject, injections);

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

    this.callbackDropdown = this.callbackDropdown.bind(this);

    // Init filters.
    this.callbackDropdown();

    const listeners = [];
    const ctrls = this.controls;
    listeners.push(this.$scope.$watch(() => ctrls.postType.selectedIndex, this.callbackDropdown));
    listeners.push(this.$scope.$watch(() => ctrls.sortBy.selectedIndex, this.callbackDropdown));
    listeners.push(this.$scope.$watch(() => ctrls.statType.selectedIndex, this.callbackDropdown));
    listeners.push(this.$scope.$watch(() => ctrls.timeRange.selectedIndex, this.callbackDropdown));
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  callbackDropdown() {
    this.HeaderService.setFilters({
      postType: this.getPostType(),
      sortBy: this.getSortBy(),
      statType: this.getStatType(),
      timeRange: this.getTimeRange(),
    });
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
    switch (sortBy.items[sortBy.selectedIndex].toLowerCase()) {
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

  getTimeRange() {
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

BranchWallHeaderController.$inject = [
  '$scope',
  'BranchService',
  'HeaderService',
  'WallService',
];

export default BranchWallHeaderController;
