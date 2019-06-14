import Constants from 'config/constants';
import Injectable from 'utils/injectable';

const {
  SortBranch,
  Time,
} = Constants.Filters;

class BranchSubbranchesHeaderController extends Injectable {
  constructor(...injections) {
    super(BranchSubbranchesHeaderController.$inject, injections);

	this.results = this.SearchService.getResults();
    this.query = '';
	
    this.callbackDropdown = this.callbackDropdown.bind(this);
    this.setDefaultControls = this.setDefaultControls.bind(this);

    this.controls = {
      sortBy: {
        items: SortBranch,
        selectedIndex: -1,
        title: 'sorted by',
      },
      timeRange: {
        items: Time,
        selectedIndex: -1,
        title: 'created',
      },
    };
    this.$timeout(() => this.setDefaultControls());

    const ctrls = this.controls;
    const {
      attachFilterListeners,
      getFilterFlatItems,
    } = this.UrlService;

    this.sortBy = getFilterFlatItems(ctrls.sortBy);
    this.timeRange = getFilterFlatItems(ctrls.timeRange);

    const { events } = this.EventService;
    const listeners = [
      ...attachFilterListeners(this.$scope, ctrls, this.callbackDropdown),
      this.EventService.on(events.CHANGE_BRANCH_PREFETCH, this.setDefaultControls),
    ];
	
	listeners.push(this.EventService.on(events.SEARCH, () => this.handleSearch()));
    listeners.push(this.$scope.$watch(() => this.query, q => this.SearchService.searchBranches(q,this.$state.params.branchid))); //add the rootid
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }
  
  //SEARCHING
  
  clearQuery() {
    this.query = '';
  }
  
      getSearchNode() {
    return document.getElementsByClassName('srch-text')[0];
  }
    search(res){
	   this.query = res;
	   this.callbackDropdown();
  }
  
  
   handleKeyPress(event) {
    const { which } = event;
    switch (which) {
      // Enter.
      case 13: {
        this.search(this.query);
		const input = this.getSearchNode();
        if (input) input.blur();
        break;
      }

      // Escape.
      case 27: {
        const input = this.getSearchNode();
        if (input) input.blur();
        break;
      }

      default:
        // Do nothing.
        break;
    }
  }
  
  
 
   handleSearch() {
    this.results = this.SearchService.getResults();
  }

 
  
  //SEARCHING END
 
  


  callbackDropdown() {
    this.HeaderService.setFilters({
      sortBy: this.getSortBy(),
      timeRange: this.getTimeRange(),
	  query: this.query,
    });

    const { applyFilter } = this.UrlService;
    const {
      sortBy,
      timeRange,
    } = this.controls;
    applyFilter(sortBy, 'sort');
    applyFilter(timeRange, 'time');
  }

  getSortBy() {
    return this.UrlService.getFilterItemParam(this.controls.sortBy, 'sort-branch');
  }

  getTimeRange() {
    return this.UrlService.getFilterItemParam(this.controls.timeRange, 'time');
  }

  setDefaultControls() {
    const {
      sortBy,
      timeRange,
    } = this.controls;
    const {
      getUrlSearchParams,
      urlToFilterItemIndex,
    } = this.UrlService;
    const {
      sort,
      time,
    } = getUrlSearchParams();
    const defaultSortByIndex = 0;
    const defaultTimeRangeIndex = 0;

    const urlIndexSortBy = urlToFilterItemIndex(sort, sortBy);
    const urlIndexTimeRange = urlToFilterItemIndex(time, timeRange);

    sortBy.selectedIndex = urlIndexSortBy !== -1 ? urlIndexSortBy : defaultSortByIndex;
    timeRange.selectedIndex = urlIndexTimeRange !== -1 ? urlIndexTimeRange : defaultTimeRangeIndex;

    // Set filters through service for other modules.
    setTimeout(() => {
      this.callbackDropdown();
    }, 0);
  }
}

BranchSubbranchesHeaderController.$inject = [
  '$scope',
  '$timeout',
  '$state',
  'EventService',
  'HeaderService',
  'UrlService',
  'WallService',
  'SearchService',

];

export default BranchSubbranchesHeaderController;
