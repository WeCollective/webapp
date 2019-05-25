import Injectable from 'utils/injectable';

class DetachBranchChildModalController extends Injectable {
  constructor(...injections) {
    super(DetachBranchChildModalController.$inject, injections);

    this.data = {};
    this.errorMessage = '';
    this.isLoading = false;

    const listeners = [];

    listeners.push(this.EventService.on(this.EventService.events.MODAL_OK, name => {
      if (name !== 'DETACH_BRANCH_CHILD') return;
      this.isLoading = true;
      this.ModalService.disabled = true;

      const params = Object.assign({}, this.data);
      const prefix = 'b/';

      if (params.branchid.indexOf(prefix) === 0) {
        params.branchid = params.branchid.substring(prefix.length);
      }

      this.BranchService
        .remove(this.ModalService.inputArgs.branchid, params.branchid)
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
      if (name !== 'DETACH_BRANCH_CHILD') return;
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

    if (!this.data.branchid) {
      this.ModalService.disableButtons();
    }
    else {
      this.ModalService.enableButtons();
    }
  }
}

DetachBranchChildModalController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'BranchService',
  'EventService',
  'ModalService',
];

export default DetachBranchChildModalController;
