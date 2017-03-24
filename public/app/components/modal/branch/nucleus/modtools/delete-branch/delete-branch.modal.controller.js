import Injectable from 'utils/injectable.js';

class BranchNucleusModtoolsDeleteBranchController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusModtoolsDeleteBranchController.$inject, injections);

    this.errorMessage = '';
    this.isLoading = false;
    this.data = {};

    this.EventService.on(this.EventService.events.MODAL_OK, (name) => {
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
    });

    this.EventService.on(this.EventService.events.MODAL_CANCEL, (name) => {
      if(name !== 'DELETE_BRANCH') return;
      this.$timeout(() => {
        this.data = {};
        this.errorMessage = '';
        this.isLoading = false;
        this.ModalService.Cancel();
      });
    });
  }
}
BranchNucleusModtoolsDeleteBranchController.$inject = ['$timeout', '$state', 'EventService', 'BranchService', 'ModalService'];

export default BranchNucleusModtoolsDeleteBranchController;
