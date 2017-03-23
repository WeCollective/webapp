import Injectable from 'utils/injectable.js';

class BranchNucleusModtoolsAddModController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusModtoolsAddModController.$inject, injections);

    this.errorMessage = '';
    this.isLoading = false;
    this.data = {};

    this.EventService.on(this.EventService.events.MODAL_OK, () => {
      this.isLoading = true;
      this.ModService.create(this.BranchService.branch.id, this.data.username).then(() => {
        this.$timeout(() => {
          this.data = {};
          this.errorMessage = '';
          this.isLoading = false;
          this.ModalService.OK();
        });
      }).catch((response) => {
        this.$timeout(() => {
          this.data = {};
          this.errorMessage = response.message;
          if(response.status == 404) {
            this.errorMessage = 'That user doesn\'t exist';
          }
          this.isLoading = false;
        });
      });
    });

    this.EventService.on(this.EventService.events.MODAL_CANCEL, () => {
      this.$timeout(() => {
        this.data = {};
        this.errorMessage = '';
        this.isLoading = false;
        this.ModalService.Cancel();
      });
    });
  }
}
BranchNucleusModtoolsAddModController.$inject = ['$timeout', '$state', 'EventService', 'BranchService', 'ModalService'];

export default BranchNucleusModtoolsAddModController;
