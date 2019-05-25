import Injectable from 'utils/injectable';

class BranchController extends Injectable {
  constructor(...injections) {
    super(BranchController.$inject, injections);
  }

  // Hack fix for Angular momentarily showing both header templates on state change where
  // one of them would be detached and showing raw code, not a good UX.
  getUIViewName(isFixed) {
    if ((isFixed && this.hasFixedHeader()) || (!isFixed && !this.hasFixedHeader())) {
      return 'header';
    }

    return '';
  }

  hasFixedHeader() {
    return !this.$state.current.name.includes('weco.branch.post');
  }

  openModal(modalType) {
    const route = `branch/${this.BranchService.branch.id}/`;
    const messageType = modalType === 'profile-picture' ? 'profile' : 'cover';
    const type = modalType === 'profile-picture' ? 'picture' : 'cover';

    this.ModalService.open(
      'UPLOAD_IMAGE',
      { route, type },
      `Successfully updated ${messageType} picture.`,
      `Unable to update ${messageType} picture.`,
    );
  }
}

BranchController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'BranchService',
  'EventService',
  'ModalService',
];

export default BranchController;
