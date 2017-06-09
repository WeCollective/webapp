import Injectable from 'utils/injectable';

class BranchNucleusFlaggedPostsController extends Injectable {
  constructor (...injections) {
    super(BranchNucleusFlaggedPostsController.$inject, injections);

    const cb = branchid => this.WallService.init('weco.branch.nucleus', true);

    let listeners = [];

    listeners.push(this.$rootScope.$watch(_ => this.WallService.controls.postType.selectedIndex, (newValue, oldValue) => {
      if (newValue !== oldValue) cb();
    }));
    
    listeners.push(this.$rootScope.$watch(_ => this.WallService.controls.sortBy.selectedIndex, (newValue, oldValue) => {
      if (newValue !== oldValue) cb();
    }));

    listeners.push(this.$rootScope.$watch(_ => this.WallService.controls.timeRange.selectedIndex, (newValue, oldValue) => {
      if (newValue !== oldValue) cb();
    }));

    listeners.push(this.EventService.on(this.EventService.events.CHANGE_BRANCH, cb));

    this.$scope.$on('$destroy', _ => listeners.forEach(deregisterListener => deregisterListener()));
  }
}

BranchNucleusFlaggedPostsController.$inject = [
  '$rootScope',
  '$scope',
  '$timeout',
  'EventService',
  'WallService'
];

export default BranchNucleusFlaggedPostsController;
