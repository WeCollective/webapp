import Injectable from 'utils/injectable';

class BranchWallController extends Injectable {
  constructor(...injections) {
    super(BranchWallController.$inject, injections);

    const cb = _ => this.WallService.init('weco.branch.wall');

    // todo cache this instead...
    //cb();

    let listeners = [];
    
    listeners.push(this.$rootScope.$watch( _ => this.WallService.controls.postType.selectedIndex, (newValue, oldValue) => {
      if (newValue !== oldValue) cb();
    }));

    listeners.push(this.$rootScope.$watch( _ => this.WallService.controls.sortBy.selectedIndex, (newValue, oldValue) => {
      if (newValue !== oldValue) cb();
    }));

    listeners.push(this.$rootScope.$watch( _ => this.WallService.controls.statType.selectedIndex, (newValue, oldValue) => {
      if (newValue !== oldValue) cb();
    }));
    
    listeners.push(this.$rootScope.$watch( _ => this.WallService.controls.timeRange.selectedIndex, (newValue, oldValue) => {
      if (newValue !== oldValue) cb();
    }));

    listeners.push(this.EventService.on(this.EventService.events.CHANGE_BRANCH, cb));

    this.$scope.$on('$destroy', _ => listeners.forEach( deregisterListener => deregisterListener() ));
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
  '$scope',
  '$state',
  'BranchService',
  'EventService',
  'WallService'
];

export default BranchWallController;