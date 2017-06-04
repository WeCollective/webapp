import Injectable from 'utils/injectable';

class BranchNucleusFlaggedPostsController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusFlaggedPostsController.$inject, injections);

    const cb = _ => this.WallService.init('weco.branch.nucleus', true);

    this.$rootScope.$watch( _ => this.WallService.controls.postType.selectedIndex, cb);
    this.$rootScope.$watch( _ => this.WallService.controls.sortBy.selectedIndex, cb);
    this.$rootScope.$watch( _ => this.WallService.controls.timeRange.selectedIndex, cb);
    this.EventService.on(this.EventService.events.CHANGE_BRANCH, cb);
  }
}

BranchNucleusFlaggedPostsController.$inject = [
  '$rootScope',
  'EventService',
  'WallService'
];

export default BranchNucleusFlaggedPostsController;