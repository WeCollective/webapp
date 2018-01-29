import Injectable from 'utils/injectable';

class BranchController extends Injectable {
  constructor(...injections) {
    super(BranchController.$inject, injections);

    this.isHeaderHidden = false;

    const listeners = [
      this.EventService.on('$stateChangeSuccess', () => {
        this.isHeaderHidden = true;
        this.$timeout(() => {
          this.isHeaderHidden = false;
        }, 1);
      }),
    ];
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  getUIViewName(isFixed) {
    if (this.isHeaderHidden) {
      return '';
    }

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
