import Injectable from 'utils/injectable';

class BranchSubbranchesController extends Injectable {
  constructor(...injections) {
    super(BranchSubbranchesController.$inject, injections);

    this.branches = [];
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
      }
    };
    this.isLoading = false;

    this.callbackDropdown = this.callbackDropdown.bind(this);
    this.callbackLoad = this.callbackLoad.bind(this);
    this.callbackScroll = this.callbackScroll.bind(this);

    const listeners = [];
    listeners.push(this.$scope.$watch(() => this.controls.sortBy.selectedIndex, this.callbackDropdown));
    listeners.push(this.$scope.$watch(() => this.controls.timeRange.selectedIndex, this.callbackDropdown));
    listeners.push(this.EventService.on(this.EventService.events.CHANGE_BRANCH, this.callbackLoad));
    listeners.push(this.EventService.on(this.EventService.events.SCROLLED_TO_BOTTOM, this.callbackScroll));
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  callbackDropdown(newValue, oldValue) {
    if (newValue !== oldValue) this.callbackLoad();
  }

  callbackLoad() {
    if (!this.$state.current.name.includes('weco.branch.subbranches')) return;
    this.getSubbranches();
  }

  callbackScroll(name) {
    if (name === 'BranchSubbranchesScrollToBottom' && this.branches.length > 0) {
      this.getSubbranches(this.branches[this.branches.length - 1].id);
    }
  }

  getSortBy() {
    switch(this.controls.sortBy.items[this.controls.sortBy.selectedIndex].toLowerCase()) {
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

  getSubbranches(lastBranchId) {
    if (this.isLoading === true) return;

    this.isLoading = true;

    const sortBy = this.getSortBy();
    const timeafter = this.getTimeafter();

    // fetch the subbranches for this branch and timefilter
    this.BranchService.getSubbranches(this.BranchService.branch.id, timeafter, sortBy, lastBranchId)
      .then(branches => this.$timeout(() => {
        // if lastBranchId was specified we are fetching _more_ branches, so append them
        this.branches = lastBranchId ? this.branches.concat(branches) : branches;

        this.isLoading = false;

        this.$scope.$apply();
      }))
      .catch(() => this.$timeout(() => {
        this.AlertsService.push('error', 'Error fetching branches.');
        this.isLoading = false;
      }));
  }

  // compute the appropriate timeafter for the selected time filter
  getTimeafter() {
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

BranchSubbranchesController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'AlertsService',
  'BranchService',
  'EventService',
  'WallService',
];

export default BranchSubbranchesController;
