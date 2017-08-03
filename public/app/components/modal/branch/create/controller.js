import Injectable from 'utils/injectable';

class CreateBranchModalController extends Injectable {
  constructor(...injections) {
    super(CreateBranchModalController.$inject, injections);

    this.onModalCancel = this.onModalCancel.bind(this);
    this.onModalSubmit = this.onModalSubmit.bind(this);

    this.errorMessage = '';
    this.newBranch = {
      parentid: this.ModalService.inputArgs.branchid,
    };

    const listeners = [];
    listeners.push(this.EventService.on(this.EventService.events.MODAL_CANCEL, this.onModalCancel));
    listeners.push(this.EventService.on(this.EventService.events.MODAL_OK, this.onModalSubmit));
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  onModalCancel(name) {
    if (name !== 'CREATE_BRANCH') return;

    this.$timeout(() => {
      this.newBranch = {};
      this.errorMessage = '';
      this.isLoading = false;
      this.ModalService.Cancel();
    });
  }

  onModalSubmit(name) {
    if (name !== 'CREATE_BRANCH') return;

    // if not all fields are filled, display message
    if (!this.newBranch || !this.newBranch.id || !this.newBranch.name) {
      return this.$timeout(() => {
        this.errorMessage = 'Please fill in all fields';
      });
    }

    // perform the update
    this.isLoading = true;
    this.newBranch.id = this.newBranch.id.toLowerCase();

    this.BranchService
      .create(this.newBranch)
      .then(() => this.$timeout(() => {
        this.isLoading = false;
        this.errorMessage = '';

        const branchid = this.newBranch.id;
        this.newBranch = {};
        this.ModalService.OK({ branchid });
      }))
      .catch(err => this.$timeout(() => {
        this.isLoading = false;
        this.errorMessage = err.message;
      }));
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
