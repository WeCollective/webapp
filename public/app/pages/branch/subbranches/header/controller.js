import Injectable from 'utils/injectable';

class BranchSubbranchesHeaderController extends Injectable {
  constructor(...injections) {
    super(BranchSubbranchesHeaderController.$inject, injections);

    this.controls = {
      sortBy: {
        items: [
          'total points',
          '# of posts',
          '# of comments',
          'date created',
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
    listeners.push(this.$scope.$watch(() => ctrls.sortBy.selectedIndex, this.callbackDropdown));
    listeners.push(this.$scope.$watch(() => ctrls.timeRange.selectedIndex, this.callbackDropdown));
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  callbackDropdown() {
    this.HeaderService.setFilters({
      sortBy: this.getSortBy(),
      timeRange: this.getTimeRange(),
    });
  }

  getSortBy() {
    const { sortBy } = this.controls;
    switch (sortBy.items[sortBy.selectedIndex].toLowerCase()) {
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

BranchSubbranchesHeaderController.$inject = [
  '$scope',
  'BranchService',
  'HeaderService',
  'WallService',
];

export default BranchSubbranchesHeaderController;
