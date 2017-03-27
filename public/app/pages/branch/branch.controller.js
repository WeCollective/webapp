import Injectable from 'utils/injectable';

class BranchController extends Injectable {
  constructor(...injections) {
    super(BranchController.$inject, injections);

    this.showCover = false;
    this.isLoading = Object.keys(this.BranchService.branch).length === 0 ? true : false;

    // update the view when the branch changes
    this.EventService.on(this.EventService.events.CHANGE_BRANCH, () => {
      this.$timeout(() => { this.isLoading = false; });
    });
  }

  isControlSelected(control) {
    return this.$state.current.name.indexOf(control) > -1;
  }

  openProfilePictureModal() {
    this.ModalService.open(
      'UPLOAD_IMAGE',
      {
        route: 'branch/' + this.BranchService.branch.id + '/',
        type: 'picture'
      },
      'Successfully updated profile picture.',
      'Unable to update profile picture.'
    );
  }

  openCoverPictureModal() {
    this.ModalService.open(
      'UPLOAD_IMAGE',
      {
        route: 'branch/' + this.BranchService.branch.id + '/',
        type: 'cover'
      },
      'Successfully updated cover picture.',
      'Unable to update cover picture.'
    );
  }

  isModerator() {
    if(!this.BranchService.branch.mods) {
      return false;
    }
    for(let i = 0; i < this.BranchService.branch.mods.length; i++) {
      if(this.BranchService.branch.mods[i].username === this.UserService.user.username) {
        return true;
      }
    }
    return false;
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
}
BranchController.$inject = ['$timeout', '$state', 'ModalService', 'UserService', 'BranchService', 'EventService'];

export default BranchController;
