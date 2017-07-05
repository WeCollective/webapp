import Injectable from 'utils/injectable';

class WallService extends Injectable {
  constructor(...injections) {
    super(WallService.$inject, injections);

    this.isCoverOpen = false;
  }

  addContent() {
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
  canAddContent() {
    switch (this.$state.current.name) {
      case 'weco.branch.subbranches':
      case 'weco.branch.wall':
      case 'weco.branch.post':
        return true;

      default:
        return false;
    }
  }

  // dynamic tooltip text for add content button, whose behaviour
  // is dependent on the current state
  getAddContentTooltip() {
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
}

WallService.$inject = [
  '$state',
  'BranchService',
  'ModalService',
];

export default WallService;
