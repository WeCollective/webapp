import Constants from 'config/constants';
import Injectable from 'utils/injectable';

const {
    Category,
    Point,
    SortPost,
    Time,
} = Constants.Filters;

class BranchWallHeaderController extends Injectable {
    constructor(...injections) {
        super(BranchWallHeaderController.$inject, injections);

        this.callbackDropdown = this.callbackDropdown.bind(this);
        this.setDefaultFilters = this.setDefaultFilters.bind(this);


        this.results = this.SearchService.getResults();
        this.query = '';


        this.filters = {
            postType: {
                items: Category,
                selectedIndex: -1,
                title: 'Post Type',
            },
            sortBy: {
                items: SortPost,
                selectedIndex: -1,
                title: 'Sorted By',
            },
            statType: {
                items: Point,
                selectedIndex: -1,
                title: 'Point Type',
            },
            timeRange: {
                items: Time,
                selectedIndex: -1,
                title: 'Time Range',
            },
        };
        this.$timeout(() => this.setDefaultFilters());

        const fltrs = this.filters;
        const {
            attachFilterListeners,
            getFilterFlatItems,
        } = this.UrlService;

        this.postType = getFilterFlatItems(fltrs.postType);
        this.sortBy = getFilterFlatItems(fltrs.sortBy);
        this.statType = getFilterFlatItems(fltrs.statType);
        this.timeRange = getFilterFlatItems(fltrs.timeRange);

        const { events } = this.EventService;
        this.initialized = false;
        const listeners = [
            ...attachFilterListeners(this.$scope, fltrs, this.callbackDropdown),
            this.EventService.on(events.CHANGE_BRANCH_PREFETCH, this.setDefaultFilters),
        ];


        listeners.push(this.EventService.on(events.SEARCH, () => this.handleSearch()));
        listeners.push(this.$scope.$watch(() => this.query, q => this.SearchService.searchPosts(q)));
        this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
    }

    //SEARCHING

    clearQuery() {
        this.query = '';
    }

    getSearchNode() {
        return document.getElementsByClassName('srch-text')[0];
    }
    search(res) {
        this.query = res;
        this.callbackDropdown();
    }


    handleKeyPress(event) {
        const { which } = event;
        switch (which) {
            // Enter.
            case 13:
                {
                    this.search(this.query);
                    const input = this.getSearchNode();
                    if (input) input.blur();
                    break;
                }

                // Escape.
            case 27:
                {
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
        if (!this.initialized) return;

        this.HeaderService.setFilters({
            postType: this.getPostType(),
            sortBy: this.getSortBy(),
            statType: this.getStatType(),
            timeRange: this.getTimeRange(),
            query: this.query,
        });

        const { applyFilter } = this.UrlService;
        const {
            postType,
            sortBy,
            statType,
            timeRange,
        } = this.filters;

        applyFilter(sortBy, 'sort');
        applyFilter(statType, 'stat');
        applyFilter(timeRange, 'time');
        applyFilter(postType, 'type');

    }

    getPostType() {
        return this.UrlService.getFilterItemParam(this.filters.postType, 'type');
    }

    getSortBy() {
        return this.UrlService.getFilterItemParam(this.filters.sortBy, 'sort');
    }

    getStatType() {
        return this.UrlService.getFilterItemParam(this.filters.statType, 'stat');
    }

    getTimeRange() {
        return this.UrlService.getFilterItemParam(this.filters.timeRange, 'time');
    }

    setDefaultFilters() {
        const {
            postType,
            sortBy,
            statType,
            timeRange,
        } = this.filters;
        const {
            getUrlSearchParams,
            urlToFilterItemIndex,
        } = this.UrlService;
        const {
            sort,
            stat,
            time,
            type,
        } = getUrlSearchParams();
        const { id } = this.BranchService.branch;
        const defaultPostTypeIndex = 0;
        const defaultSortByIndex = id === 'root' ? 0 : 2;
        const defaultStatTypeIndex = 0;
        const defaultTimeRangeIndex = id === 'root' ? 3 : 0;

        const urlIndexPostType = urlToFilterItemIndex(type, postType);
        const urlIndexSortBy = urlToFilterItemIndex(sort, sortBy);
        const urlIndexStatType = urlToFilterItemIndex(stat, statType);
        const urlIndexTimeRange = urlToFilterItemIndex(time, timeRange);

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
}

BranchWallHeaderController.$inject = [
    '$scope',
    '$timeout',
    'BranchService',
    'EventService',
    'HeaderService',
    'UrlService',
    'WallService',
    'SearchService',
];

export default BranchWallHeaderController;