import Injectable from 'utils/injectable';

class BranchSubbranchesController extends Injectable {
  constructor(...injections) {
    super(BranchSubbranchesController.$inject, injections);

    this.branches = [];
    this.isLoading = false;
    this.lastRequest = {
      id: undefined,
      lastId: undefined,
      sortBy: undefined,
      timeRange: undefined,
    };

    this.callbackScroll = this.callbackScroll.bind(this);
    this.getSubbranches = this.getSubbranches.bind(this);

    // Do the initial load so the loader appears straight away.
    this.getSubbranches();

    const listeners = [];
    const { events } = this.EventService;
    listeners.push(this.EventService.on(events.CHANGE_BRANCH, () => this.getSubbranches()));
    listeners.push(this.EventService.on(events.CHANGE_FILTER, () => this.getSubbranches()));
    listeners.push(this.EventService.on(events.SCROLLED_TO_BOTTOM, this.callbackScroll));
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  callbackScroll(name) {
    const items = this.branches.length;
    if (name === 'ScrollToBottom' && items > 0) {
      this.getSubbranches(this.branches[items - 1].id);
    }
  }

  getSubbranches(lastId) {
    if (this.isLoading === true || !this.$state.current.name.includes('weco.branch.subbranches')) {
      return;
    }

    const filters = this.HeaderService.getFilters();
    const id = this.$state.params.branchid;
    const lr = this.lastRequest;
    const {
      sortBy,
      timeRange,
    } = filters;

    // Don't send the request if nothing changed.
    if (lr.id === id && lr.lastId === lastId &&
      lr.sortBy === sortBy && lr.timeRange === timeRange) {
      return;
    }

    // Update the last request values to compare with the next call.
    this.lastRequest.id = id;
    this.lastRequest.lastId = lastId;
    this.lastRequest.sortBy = sortBy;
    this.lastRequest.timeRange = timeRange;

    this.isLoading = true;
    this.BranchService.getSubbranches(id, timeRange, sortBy, lastId)
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
}

BranchSubbranchesController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'AlertsService',
  'BranchService',
  'EventService',
  'HeaderService',
];

export default BranchSubbranchesController;
