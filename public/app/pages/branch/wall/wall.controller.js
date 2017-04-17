import Injectable from 'utils/injectable';

class BranchWallController extends Injectable {
  constructor(...injections) {
    super(BranchWallController.$inject, injections);

    this.WallService.init('weco.branch.wall');
    this.$rootScope.$watch(() => this.WallService.controls.timeRange.selectedIndex, () => { this.WallService.init('weco.branch.wall'); });
    this.$rootScope.$watch(() => this.WallService.controls.postType.selectedIndex, () => { this.WallService.init('weco.branch.wall'); });
    this.$rootScope.$watch(() => this.WallService.controls.sortBy.selectedIndex, () => { this.WallService.init('weco.branch.wall'); });
    this.$rootScope.$watch(() => this.WallService.controls.statType.selectedIndex, () => { this.WallService.init('weco.branch.wall'); });
    this.EventService.on(this.EventService.events.CHANGE_BRANCH, () => { this.WallService.init('weco.branch.wall'); });
  }

  // return the correct ui-sref string for when the specified post is clicked
  getLink(post) {
    if(post.type === 'text' || post.type === 'poll') {
      return this.$state.href('weco.branch.post', { postid: post.id });
    }
    return post.text;
  }
}
BranchWallController.$inject = ['$timeout', '$rootScope', '$state', 'EventService', 'WallService'];

export default BranchWallController;
