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

      if (this.data.branchid.indexOf('b/') === 0) {
        this.data.branchid = this.data.branchid.substring('b/'.length);
      }

      this.isLoading = true;
      this.BranchService
        .remove(this.data.branchid)
        .then(() => this.$timeout(() => {
          this.data = {};
          this.errorMessage = '';
          this.isLoading = false;
          this.ModalService.OK();
        }))
        .catch(err => this.$timeout(() => {
          this.errorMessage = err.message;
          this.isLoading = false;
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
      this.ModalService.disableOK();
    }
    else {
      this.ModalService.enableOK();
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
