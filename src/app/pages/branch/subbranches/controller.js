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
      },
    };
    this.isLoading = false;
    this.lastRequest = {
      id: undefined,
      lastId: undefined,
      sortBy: undefined,
      timeAfter: undefined,
    };

    this.callbackDropdown = this.callbackDropdown.bind(this);
    this.callbackScroll = this.callbackScroll.bind(this);
    this.getSubbranches = this.getSubbranches.bind(this);

    // Do the initial load so the loader appears straight away.
    this.getSubbranches();

    const listeners = [];
    const $s = this.$scope;
    const { events } = this.EventService;
    listeners.push($s.$watch(() => this.controls.sortBy.selectedIndex, this.callbackDropdown));
    listeners.push($s.$watch(() => this.controls.timeRange.selectedIndex, this.callbackDropdown));
    listeners.push(this.EventService.on(events.CHANGE_BRANCH, () => this.getSubbranches()));
    listeners.push(this.EventService.on(events.SCROLLED_TO_BOTTOM, this.callbackScroll));
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  callbackDropdown(newValue, oldValue) {
    if (newValue !== oldValue) this.getSubbranches();
  }

  callbackScroll(name) {
    const items = this.branches.length;
    if (name === 'ScrollToBottom' && items > 0) {
      this.getSubbranches(this.branches[items - 1].id);
    }
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

  getSubbranches(lastId) {
    if (this.isLoading === true || !this.$state.current.name.includes('weco.branch.subbranches')) {
      return;
    }

    const id = this.$state.params.branchid;
    const lr = this.lastRequest;
    const sortBy = this.getSortBy();
    const timeAfter = this.getTimeAfter();

    // Don't send the request if nothing changed.
    if (lr.id === id && lr.lastId === lastId &&
      lr.sortBy === sortBy && lr.timeAfter === timeAfter) {
      return;
    }

    // Update the last request values to compare with the next call.
    this.lastRequest.id = id;
    this.lastRequest.lastId = lastId;
    this.lastRequest.sortBy = sortBy;
    this.lastRequest.timeAfter = timeAfter;

    this.isLoading = true;

    this.BranchService.getSubbranches(id, timeAfter, sortBy, lastId)
      .then(branches => this.$timeout(() => {
        // if lastId was specified we are fetching _more_ branches, so append them
        this.branches = lastId ? this.branches.concat(branches) : branches;

        this.isLoading = false;

        this.$scope.$apply();
      }))
      .catch(() => this.$timeout(() => {
        this.AlertsService.push('error', 'Error fetching branches.');
        this.isLoading = false;
      }));
  }

  getTimeAfter() {
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
