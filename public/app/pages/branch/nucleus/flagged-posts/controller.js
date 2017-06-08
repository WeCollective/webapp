import Injectable from 'utils/injectable';

class BranchNucleusFlaggedPostsController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusFlaggedPostsController.$inject, injections);

    const cb = _ => this.WallService.init('weco.branch.nucleus', true);

    // todo timeout not tested, remove function and leave only the return value
    this.$timeout( _ => {
      this.$rootScope.$watch( _ => this.WallService.controls.postType.selectedIndex, cb);
      this.$rootScope.$watch( _ => this.WallService.controls.sortBy.selectedIndex, cb);
      this.$rootScope.$watch( _ => this.WallService.controls.timeRange.selectedIndex, cb);
    }, 0);

    this.EventService.on(this.EventService.events.CHANGE_BRANCH, cb);
  }
}

BranchNucleusFlaggedPostsController.$inject = [
  '$rootScope',
  '$timeout',
  'EventService',
  'WallService'
];

export default BranchNucleusFlaggedPostsController;