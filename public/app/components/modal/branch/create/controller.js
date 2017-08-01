import Injectable from 'utils/injectable';

class CreateBranchModalController extends Injectable {
  constructor(...injections) {
    super(CreateBranchModalController.$inject, injections);

    this.newBranch = { parentid: this.ModalService.inputArgs.branchid };
    this.errorMessage = '';

    const listeners = [];

    listeners.push(this.EventService.on(this.EventService.events.MODAL_OK, (name) => {
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
    }));

    listeners.push(this.EventService.on(this.EventService.events.MODAL_CANCEL, (name) => {
      if(name !== 'CREATE_BRANCH') return;
      this.$timeout(() => {
        this.newBranch = {};
        this.errorMessage = '';
        this.isLoading = false;
        this.ModalService.Cancel();
      });
    }));

    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }
}

CreateBranchModalController.$inject = [
  '$scope',
  '$timeout',
  'BranchService',
  'EventService',
  'ModalService',
];

export default CreateBranchModalController;
