import Injectable from 'utils/injectable';

class BranchWallController extends Injectable {
  constructor(...injections) {
    super(BranchWallController.$inject, injections);

    const cb = _ => this.WallService.init('weco.branch.wall');

    cb();
    this.$rootScope.$watch( _ => this.WallService.controls.postType.selectedIndex, cb );
    this.$rootScope.$watch( _ => this.WallService.controls.sortBy.selectedIndex, cb );
    this.$rootScope.$watch( _ => this.WallService.controls.statType.selectedIndex, cb );
    this.$rootScope.$watch( _ => this.WallService.controls.timeRange.selectedIndex, cb );
    this.EventService.on(this.EventService.events.CHANGE_BRANCH, cb );
  }

  // return the correct ui-sref string for when the specified post is clicked
  getLink (post) {
    if ('text' === post.type || 'poll' === post.type) {
      return this.$state.href('weco.branch.post', { postid: post.id });
    }

    return post.text;
  }
}

BranchWallController.$inject = [
  '$rootScope',
  '$state',
  '$timeout',
  'BranchService',
  'EventService',
  'WallService'
];

export default BranchWallController;