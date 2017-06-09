import Injectable from 'utils/injectable';

class BranchController extends Injectable {
  constructor (...injections) {
    super(BranchController.$inject, injections);

    this.isLoading = Object.keys(this.BranchService.branch).length < 2;

    // update the view when the branch changes
    this.EventService.on(this.EventService.events.CHANGE_BRANCH, _ => this.$timeout(_ => this.isLoading = false));
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

    if (!!modalName) {
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

  isControlSelected (control) {
    return this.$state.current.name.includes(control);
  }

  isModerator () {
    if (!this.BranchService.branch.mods) {
      return false;
    }

    for (let i = 0; i < this.BranchService.branch.mods.length; i++) {
      if (this.BranchService.branch.mods[i].username === this.UserService.user.username) {
        return true;
      }
    }

    return false;
  }

  openModal (modalType) {
    const route = `branch/${this.BranchService.branch.id}/`,
      messageType = ('profile-picture' === modalType) ? 'profile' : 'cover',
      type = ('profile-picture' === modalType) ? 'picture' : 'cover';

    this.ModalService.open('UPLOAD_IMAGE', { route, type },
      `Successfully updated ${messageType} picture.`, `Unable to update ${messageType} picture.` );
  }
}

BranchController.$inject = [
  '$state',
  '$timeout',
  'AppService',
  'BranchService',
  'EventService',
  'ModalService',
  'UserService'
];

export default BranchController;
