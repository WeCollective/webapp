import Injectable from 'utils/injectable.js';

class SubmitSubbranchRequestModalController extends Injectable {
  constructor(...injections) {
    super(SubmitSubbranchRequestModalController.$inject, injections);

    this.errorMessage = '';
    this.isLoading = false;
    this.data = {};

    this.EventService.on(this.EventService.events.MODAL_OK, (name) => {
      if(name !== 'SUBMIT_SUBBRANCH_REQUEST') return;

      if(!this.data || !this.data.parentid) {
        return this.$timeout(() => { this.errorMessage = 'Please fill in all fields'; });
      }

      this.isLoading = true;
      let branchid = this.ModalService.inputArgs.branchid;
      this.BranchService.submitSubbranchRequest(this.data.parentid, branchid).then(() => {
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
      if(name !== 'SUBMIT_SUBBRANCH_REQUEST') return;

      this.$timeout(() => {
        this.data = {};
        this.errorMessage = '';
        this.isLoading = false;
        this.ModalService.Cancel();
      });
    });
  }
}

SubmitSubbranchRequestModalController.$inject = ['$timeout', 'BranchService', 'EventService', 'ModalService'];

export default SubmitSubbranchRequestModalController;
