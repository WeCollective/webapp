import Injectable from 'utils/injectable';

class BranchNucleusFlaggedPostsController extends Injectable {
  constructor (...injections) {
    super(BranchNucleusFlaggedPostsController.$inject, injections);

    const cache = this.LocalStorageService.getObject('cache').branchNucleusFlaggedPosts || {};

    this.posts = cache[this.BranchService.branch.id] || [];

    this.cb = this.cb.bind(this);

    let listeners = [];

    listeners.push(this.$rootScope.$watch(_ => this.WallService.controls.postType.selectedIndex, (newValue, oldValue) => {
      if (newValue !== oldValue) this.cb();
    }));
    
    listeners.push(this.$rootScope.$watch(_ => this.WallService.controls.sortBy.selectedIndex, (newValue, oldValue) => {
      if (newValue !== oldValue) this.cb();
    }));

    listeners.push(this.$rootScope.$watch(_ => this.WallService.controls.timeRange.selectedIndex, (newValue, oldValue) => {
      if (newValue !== oldValue) this.cb();
    }));

    listeners.push(this.EventService.on(this.EventService.events.CHANGE_BRANCH, this.cb));

    this.$scope.$on('$destroy', _ => listeners.forEach(deregisterListener => deregisterListener()));
  }

  cb (branchid) {
    this.WallService.init('weco.branch.nucleus', true)
      .then(posts => {
        this.posts = posts;

        let cache = this.LocalStorageService.getObject('cache');
        cache.branchNucleusFlaggedPosts = cache.branchNucleusFlaggedPosts || {};
        cache.branchNucleusFlaggedPosts[this.BranchService.branch.id] = this.posts;
        this.LocalStorageService.setObject('cache', cache);
        
        // The view would not update otherwise.
        this.$scope.$apply();
      });
  }
}

BranchNucleusFlaggedPostsController.$inject = [
  '$rootScope',
  '$scope',
  '$timeout',
  'BranchService',
  'EventService',
  'LocalStorageService',
  'WallService'
];

export default BranchNucleusFlaggedPostsController;
