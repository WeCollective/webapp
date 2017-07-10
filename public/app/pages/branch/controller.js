import Injectable from 'utils/injectable';

class BranchController extends Injectable {
  constructor(...injections) {
    super(BranchController.$inject, injections);

    this.isLoading = Object.keys(this.BranchService.branch).length < 2;

    // update the view when the branch changes
    this.EventService.on(this.EventService.events.CHANGE_BRANCH, () => this.$timeout(() => this.isLoading = false));
  }

  isControlSelected(control) {
    return this.$state.current.name.includes(control);
  }

  isModerator() {
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

  openModal(modalType) {
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
  'UserService',
];

export default BranchController;
