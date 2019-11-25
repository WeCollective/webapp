import Injectable from 'utils/injectable';

class BranchSubbranchesController extends Injectable {
    constructor(...injections) {
        super(BranchSubbranchesController.$inject, injections);
        this.callbackScroll = this.callbackScroll.bind(this);
        this.getItems = this.getItems.bind(this);
        this.isInit = true;
        this.isWaitingForRequest = false;
        this.items = [];
        this.lastRequest = {
            id: undefined,
            lastId: undefined,
            sortBy: undefined,
            timeRange: undefined,
            query: undefined,
        };

        const { events } = this.EventService;
        const listeners = [
            this.EventService.on(events.CHANGE_BRANCH_PREFETCH, () => this.getItems()),
            this.EventService.on(events.CHANGE_FILTER, () => this.getItems()),
            this.EventService.on(events.SCROLLED_TO_BOTTOM, () => this.callbackScroll()),
        ];
        this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
    }

    callbackScroll() {
        const { items } = this;
        if (items.length) {
            this.getItems(items[items.length - 1].id);
        }
    }

    getItems(lastId) {
        const {
            current,
            params,
        } = this.$state;

        if (this.isWaitingForRequest || !current.name.includes('weco.branch.subbranches')) {
            return;
        }



        const filters = this.HeaderService.getFilters();
        const id = params.branchid;
        const lr = this.lastRequest;
        const {
            sortBy,
            timeRange,
            query,
        } = filters;



        // Don't send the request if nothing changed.
        if (lr.id === id && lr.lastId === lastId &&
            lr.sortBy === sortBy && lr.timeRange === timeRange && lr.query === query) {
            return;
        }

        // Update the last request values to compare with the next call.
        this.lastRequest.id = id;
        this.lastRequest.lastId = lastId;
        this.lastRequest.sortBy = sortBy;
        this.lastRequest.timeRange = timeRange;
        this.lastRequest.query = query;

        this.isWaitingForRequest = true;
        this.BranchService.getSubbranches(id, timeRange, sortBy, lastId, query, true)
            .then(branches => this.$timeout(() => {
                // if lastId was specified we are fetching _more_ branches, so append them
                this.items = lastId ? this.items.concat(branches) : branches;
                this.isInit = false;
                this.isWaitingForRequest = false;
                this.$scope.$apply();
            }))
            .catch(() => this.$timeout(() => {
                this.AlertsService.push('error', 'Error fetching branches.');
                this.isInit = false;
                this.isWaitingForRequest = false;
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