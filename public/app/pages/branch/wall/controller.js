import Injectable from 'utils/injectable';

class BranchWallController extends Injectable {
  constructor (...injections) {
    super(BranchWallController.$inject, injections);

    this.posts = [];

    this.cb = this.cb.bind(this);

    let listeners = [];
    
    listeners.push(this.$rootScope.$watch(_ => this.WallService.controls.postType.selectedIndex, (newValue, oldValue) => {
      if (newValue !== oldValue) this.cb();
    }));

    listeners.push(this.$rootScope.$watch(_ => this.WallService.controls.sortBy.selectedIndex, (newValue, oldValue) => {
      if (newValue !== oldValue) this.cb();
    }));

    listeners.push(this.$rootScope.$watch(_ => this.WallService.controls.statType.selectedIndex, (newValue, oldValue) => {
      if (newValue !== oldValue) this.cb();
    }));
    
    listeners.push(this.$rootScope.$watch(_ => this.WallService.controls.timeRange.selectedIndex, (newValue, oldValue) => {
      if (newValue !== oldValue) this.cb();
    }));

    listeners.push(this.EventService.on(this.EventService.events.CHANGE_BRANCH, this.cb));

    this.$scope.$on('$destroy', _ => listeners.forEach(deregisterListener => deregisterListener()));
  }

  addContent () {
    let errorMessage,
      modalName,
      successMessage;

    switch (this.$state.current.name) {
      case 'weco.branch.subbranches':
        modalName = 'CREATE_BRANCH';
        successMessage = 'Successfully created new branch!';
        errorMessage = 'Error creating new branch.';
        break;

      case 'weco.branch.wall':
        modalName = 'CREATE_POST';
        successMessage = 'Successfully created post!';
        errorMessage = 'Error creating post.';
        break;

      // case 'weco.branch.post':
      //   // broadcast add comment clicked so that the comment section is scrolled
      //   // to the top, where the comment box is visible
      //   $rootScope.$broadcast('add-comment');
    }

    if (modalName) {
      this.ModalService.open(modalName, { branchid: this.BranchService.branch.id },
        successMessage, errorMessage);
    }
  }

  // returns boolean indicating whether the add content behaviour has any defined
  // behaviour in the current state
  canAddContent () {
    switch (this.$state.current.name) {
      case 'weco.branch.subbranches':
      case 'weco.branch.wall':
      case 'weco.branch.post':
        return true;

      default:
        return false;
    }
  }

  cb () {
    this.WallService.init('weco.branch.wall')
      .then(posts => {
        this.posts = posts;
        this.$scope.$apply();
      });
  }

  // dynamic tooltip text for add content button, whose behaviour
  // is dependent on the current state
  getAddContentTooltip () {
    switch (this.$state.current.name) {
      case 'weco.branch.subbranches':
        return 'Create New Branch';

      case 'weco.branch.wall':
        return 'Add New Post';

      case 'weco.branch.post':
        return 'Write a Comment';

      default:
        return '';
    }
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
  'AppService',
  'BranchService',
  'EventService',
  'ModalService',
  'WallService'
];

export default BranchWallController;
