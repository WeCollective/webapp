import Injectable from 'utils/injectable';

class BranchController extends Injectable {
  constructor(...injections) {
    super(BranchController.$inject, injections);

    this.isLoading = Object.keys(this.BranchService.branch).length < 2;

    this.EventService.on(this.EventService.events.CHANGE_BRANCH, () => {
      this.$timeout(() => this.isLoading = false);
    });
  }

  getHeaderClassName() {
    let className = 'header style--fixed';

    // Post views need taller header for the post preview.
    if (this.$state.current.name.includes('weco.branch.post')) {
      className += ' style--fixed-post';
    }

    return className;
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
  '$state',
  '$timeout',
  'AlertsService',
  'AppService',
  'BranchService',
  'EventService',
  'ModalService',
  'UserService',
];

export default BranchController;
