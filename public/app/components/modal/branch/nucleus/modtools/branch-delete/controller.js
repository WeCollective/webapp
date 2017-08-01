import Injectable from 'utils/injectable';

class DeleteBranchModalController extends Injectable {
  constructor(...injections) {
    super(DeleteBranchModalController.$inject, injections);

    this.errorMessage = '';
    this.isLoading = false;
    this.data = {};

    const listeners = [];

    listeners.push(this.EventService.on(this.EventService.events.MODAL_OK, (name) => {
      if(name !== 'DELETE_BRANCH') return;
      // if not all fields are filled, display message
      if(!this.data || !this.data.branchid) {
        this.$timeout(() => { this.errorMessage = 'Please fill in all fields'; });
        return;
      }

      this.isLoading = true;
      this.BranchService.remove(this.data.branchid).then(() => {
        this.$timeout(() => {
          this.data = {};
          this.errorMessage = '';
          this.isLoading = false;
          this.ModalService.OK();
        });
      }).catch((response) => {
        this.$timeout(() => {
          this.errorMessage = response.message;
          this.isLoading = false;
        });
      });
    }));

    listeners.push(this.EventService.on(this.EventService.events.MODAL_CANCEL, (name) => {
      if(name !== 'DELETE_BRANCH') return;
      this.$timeout(() => {
        this.data = {};
        this.errorMessage = '';
        this.isLoading = false;
        this.ModalService.Cancel();
      });
    }));

    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
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
