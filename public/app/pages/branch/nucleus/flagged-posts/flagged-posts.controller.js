import Injectable from 'utils/injectable';

class BranchNucleusFlaggedPostsController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusFlaggedPostsController.$inject, injections);

    this.WallService.init('weco.branch.nucleus', true);
    this.$rootScope.$watch(() => this.WallService.controls.timeRange.selectedIndex, () => { this.WallService.init('weco.branch.nucleus', true); });
    this.$rootScope.$watch(() => this.WallService.controls.postType.selectedIndex, () => { this.WallService.init('weco.branch.nucleus', true); });
    this.$rootScope.$watch(() => this.WallService.controls.sortBy.selectedIndex, () => { this.WallService.init('weco.branch.nucleus', true); });
    this.EventService.on(this.EventService.events.CHANGE_BRANCH, () => { this.WallService.init('weco.branch.nucleus', true); });
  }
}
BranchNucleusFlaggedPostsController.$inject = ['$rootScope', 'WallService', 'EventService'];

export default BranchNucleusFlaggedPostsController;
