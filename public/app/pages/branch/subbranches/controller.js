import Injectable from 'utils/injectable';

class BranchSubbranchesController extends Injectable {
  constructor (...injections) {
    super(BranchSubbranchesController.$inject, injections);

    this.branches = [];
    this.controls = {
      sortBy: {
        items: [
          'total points',
          '# of posts',
          '# of comments',
          'date created'
        ],
        selectedIndex: 0
      },
      timeRange: {
        items: [
          'all time',
          'past year',
          'past month',
          'past week',
          'past 24 hrs',
          'past hour'
        ],
        selectedIndex: 0
      }
    };
    this.isLoading = false;
    this.isLoadingMore = false;

    this.init = this.init.bind(this);

    let listeners = [];

    listeners.push(this.$scope.$watch(_ => this.controls.sortBy.selectedIndex, (newValue, oldValue) => {
      if (newValue !== oldValue) this.init();
    }));

    listeners.push(this.$scope.$watch(_ => this.controls.timeRange.selectedIndex, (newValue, oldValue) => {
      if (newValue !== oldValue) this.init();
    }));

    listeners.push(this.EventService.on(this.EventService.events.CHANGE_BRANCH, this.init));
    
    listeners.push(this.EventService.on(this.EventService.events.SCROLLED_TO_BOTTOM, name => {
      if (name !== 'BranchSubbranchesScrollToBottom') return;
      
      if (!this.isLoadingMore) {
        this.isLoadingMore = true;

        if (this.branches.length) {
          this.getSubbranches(this.branches[this.branches.length - 1].id);
        }
      }
    }));

    this.$scope.$on('$destroy', _ => listeners.forEach(deregisterListener => deregisterListener()));
  }

  getSortBy () {
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

  getSubbranches (lastBranchId) {
    if (this.isLoading === true) return;

    this.isLoading = true;

    const sortBy = this.getSortBy();
    const timeafter = this.getTimeafter();

    // fetch the subbranches for this branch and timefilter
    this.BranchService.getSubbranches(this.BranchService.branch.id, timeafter, sortBy, lastBranchId)
      .then(branches => {
        this.$timeout(_ => {
          // if lastBranchId was specified we are fetching _more_ branches, so append them
          this.branches = lastBranchId ? this.branches.concat(branches) : branches;

          this.isLoading = false;
          this.isLoadingMore = false;

          this.$scope.$apply();
        });
      })
      .catch(_ => {
        this.AlertsService.push('error', 'Error fetching branches.');
        this.$timeout(_ => this.isLoading = false);
      });
  }

  // compute the appropriate timeafter for the selected time filter
  getTimeafter () {
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

  init () {
    if (!this.$state.current.name.includes('weco.branch.subbranches')) {
      return;
    }

    if (Object.keys(this.BranchService.branch).length < 2) {
      return;
    }

    this.getSubbranches();
  }
}

BranchSubbranchesController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'AlertsService',
  'BranchService',
  'EventService'
];

export default BranchSubbranchesController;
