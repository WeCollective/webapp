import Injectable from 'utils/injectable';

class WallService extends Injectable {
  constructor(...injections) {
    super(WallService.$inject, injections);

    this.isCoverOpen = false;
  }

  getHeaderButtonTooltip() {
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

  handleHeaderButtonClick() {
    const branchid = this.BranchService.branch.id;

    let errMsg;
    let name;
    let successMsg;

    switch (this.$state.current.name) {
      case 'weco.branch.subbranches':
        name = 'CREATE_BRANCH';
        successMsg = args => `Successfully created b/${args.branchid}!`;
        errMsg = 'Error creating new branch.';
        break;

      case 'weco.branch.wall':
        name = 'CREATE_POST';
        successMsg = 'Successfully created post!';
        errMsg = 'Error creating post.';
        break;

      /*
      // broadcast add comment clicked so that the comment section is scrolled
      // to the top, where the comment box is visible
      case 'weco.branch.post':
        $rootScope.$broadcast('add-comment');
      */
    }

    if (name) {
      this.ModalService.open(name, { branchid }, successMsg, errMsg);
    }
  }

  isHeaderButtonVisible() {
    const allowedStates = [
      'weco.branch.subbranches',
      'weco.branch.wall',
      'weco.branch.post',
    ];

    return this.UserService.isAuthenticated() && allowedStates.includes(this.$state.current.name);
  }
}

WallService.$inject = [
  '$state',
  'BranchService',
  'ModalService',
  'UserService',
];

export default WallService;
