import Injectable from 'utils/injectable.js';

class CreateBranchModalController extends Injectable {
  constructor(...injections) {
    super(CreateBranchModalController.$inject, injections);

    this.newBranch = { parentid: this.ModalService.inputArgs.branchid };
    this.errorMessage = '';

    this.EventService.on(this.EventService.events.MODAL_OK, (name) => {
      if(name !== 'CREATE_BRANCH') return;

      // if not all fields are filled, display message
      if(!this.newBranch || !this.newBranch.id || !this.newBranch.name) {
        return this.$timeout(() => {
          this.errorMessage = 'Please fill in all fields';
        });
      }

      // perform the update
      this.isLoading = true;
      this.newBranch.id = this.newBranch.id.toLowerCase();
      this.BranchService.create(this.newBranch).then(() => {
        this.$timeout(() => {
          let id = this.newBranch.id;
          this.newBranch = {};
          this.errorMessage = '';
          this.isLoading = false;
          this.ModalService.OK({ branchid: id });
        });
      }).catch((response) => {
        this.$timeout(() => {
          this.errorMessage = response.message;
          this.isLoading = false;
        });
      });
    });

    this.EventService.on(this.EventService.events.MODAL_CANCEL, (name) => {
      if(name !== 'CREATE_BRANCH') return;
      this.$timeout(() => {
        this.newBranch = {};
        this.errorMessage = '';
        this.isLoading = false;
        this.ModalService.Cancel();
      });
    });
  }
}
CreateBranchModalController.$inject = ['$timeout', 'BranchService', 'ModalService', 'EventService'];

export default CreateBranchModalController;
