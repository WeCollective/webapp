import Injectable from 'utils/injectable';

class BranchSubbranchesController extends Injectable {
  constructor(...injections) {
    super(BranchSubbranchesController.$inject, injections);

    this.isLoading = false;
    this.isLoadingMore = false;
    this.branches = [];
    this.controls = {
      timeRange: {
        selectedIndex: 0,
        items: ['ALL TIME', 'PAST YEAR', 'PAST MONTH', 'PAST WEEK', 'PAST 24 HRS', 'PAST HOUR']
      },
      sortBy: {
        selectedIndex: 0,
        items: ['TOTAL POINTS', '# OF POSTS', '# OF COMMENTS', 'DATE CREATED']
      }
    };

    let init = () => {
      if(this.$state.current.name.indexOf('weco.branch') === -1) return;
      if(Object.keys(this.BranchService.branch).length === 0) return;

      this.getSubbranches();
    };

    init();
    this.EventService.on(this.EventService.events.CHANGE_BRANCH, init);
  }

  loadMore() {
    if(!this.isLoadingMore) {
      this.isLoadingMore = true;
      if(this.branches.length > 0) {
        this.getSubbranches(this.branches[this.branches.length - 1].id);
      }
    }
  }

  // compute the appropriate timeafter for the selected time filter
  getTimeafter(timeItem) {
    let timeafter;
    let date = new Date();
    switch(timeItem) {
      case 'ALL TIME':
        timeafter = 0;
        break;
      case 'PAST YEAR':
        timeafter = new Date().setFullYear(new Date().getFullYear() - 1);
        break;
      case 'PAST MONTH':
        timeafter = new Date().setMonth(new Date().getMonth() - 1);
        break;
      case 'PAST WEEK':
        timeafter = new Date().setDate(new Date().getDate() - 7);
        break;
      case 'PAST 24 HRS':
        timeafter = new Date().setDate(new Date().getDate() - 1);
        break;
      case 'PAST HOUR':
        timeafter = new Date().setHours(new Date().getHours() - 1);
        break;
      default:
        timeafter = 0;
        break;
    }
    return timeafter;
  }

  getSubbranches(lastBranchId) {
    this.isLoading = true;
    
    let timeafter = this.getTimeafter(this.controls.timeRange.items[this.controls.timeRange.selectedIndex]);
    let sortBy;
    switch(this.controls.sortBy.items[this.controls.sortBy.selectedIndex]) {
      case 'TOTAL POINTS':
        sortBy = 'post_points';
        break;
      case 'DATE CREATED':
        sortBy = 'date';
        break;
      case '# OF POSTS':
        sortBy = 'post_count';
        break;
      case '# OF COMMENTS':
        sortBy = 'post_comments';
        break;
      default:
        sortBy = 'date';
        break;
    }

    // fetch the subbranches for this branch and timefilter
    this.BranchService.getSubbranches(this.BranchService.branch.id, timeafter, sortBy, lastBranchId).then((branches) => {
      this.$timeout(() => {
        // if lastBranchId was specified we are fetching _more_ branches, so append them
        if(lastBranchId) {
          this.branches = this.branches.concat(branches);
        } else {
          this.branches = branches;
        }
        this.isLoading = false;
        this.isLoadingMore = false;
      });
    }).catch(() => {
      this.AlertsService.push('error', 'Error fetching branches.');
      this.$timeout(() => { this.isLoading = false; });
    });
  }
}
BranchSubbranchesController.$inject = ['$timeout', '$state', 'BranchService', 'AlertsService', 'EventService'];

export default BranchSubbranchesController;
