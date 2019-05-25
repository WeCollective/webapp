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

    this.ModalService.disabled = true;

    // if not all fields are filled, display message
    if (!this.newBranch || !this.newBranch.id || !this.newBranch.name) {
      this.$timeout(() => {
        this.errorMessage = 'Please fill in all fields';
        this.ModalService.disabled = false;
      });
      return;
    }

    // perform the update
    this.isLoading = true;
    this.newBranch.id = this.newBranch.id.toLowerCase();

    this.BranchService
      .create(this.newBranch)
      .then(() => this.$timeout(() => {
        this.isLoading = false;
        this.ModalService.disabled = false;
        this.errorMessage = '';

        const branchid = this.newBranch.id;
        this.newBranch = {};

        this.UserService.followBranch('me', branchid, true)
          .then(() => this.ModalService.OK({ branchid }))
          .then(() => this.$state.go('weco.branch.wall', { branchid }));
      }))
      .catch(err => this.$timeout(() => {
        this.isLoading = false;
        this.ModalService.disabled = false;
        this.errorMessage = err.message;
      }));
  }
}

CreateBranchModalController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'BranchService',
  'EventService',
  'ModalService',
  'UserService',
];

export default CreateBranchModalController;
