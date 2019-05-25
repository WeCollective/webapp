import Injectable from 'utils/injectable';

class DeleteBranchModalController extends Injectable {
  constructor(...injections) {
    super(DeleteBranchModalController.$inject, injections);

    this.data = {};
    this.errorMessage = '';
    this.isLoading = false;

    // Disable submission by default.
    this.ModalService.disableButtons();

    const listeners = [];

    listeners.push(this.EventService.on(this.EventService.events.MODAL_OK, name => {
      if (name !== 'DELETE_BRANCH') return;
      this.isLoading = true;
      this.ModalService.disabled = true;

      const params = Object.assign({}, this.data);

      this.BranchService
        .remove(params.branchid)
        .then(() => this.$timeout(() => {
          this.data = {};
          this.errorMessage = '';
          this.isLoading = false;
          this.ModalService.disabled = false;
          this.ModalService.OK(params);
        }))
        .catch(err => this.$timeout(() => {
          this.errorMessage = err.message;
          this.isLoading = false;
          this.ModalService.disabled = false;
        }));
    }));

    listeners.push(this.EventService.on(this.EventService.events.MODAL_CANCEL, name => {
      if (name !== 'DELETE_BRANCH') return;
      this.$timeout(() => {
        this.data = {};
        this.errorMessage = '';
        this.isLoading = false;
        this.ModalService.Cancel();
      });
    }));

    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  handleChange() {
    this.data.branchid = this.data.branchid.split(' ').join('');

    if (this.data.branchid !== this.ModalService.inputArgs.branchid) {
      this.ModalService.disableButtons();
    }
    else {
      this.ModalService.enableButtons();
    }
  }
}

DeleteBranchModalController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'BranchService',
  'EventService',
  'ModalService',
];

export default DeleteBranchModalController;
