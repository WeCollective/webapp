import Injectable from 'utils/injectable';

class AddModModalController extends Injectable {
  constructor(...injections) {
    super(AddModModalController.$inject, injections);

    this.errorMessage = '';
    this.isLoading = false;
    this.data = {};

    const listeners = [];

    listeners.push(this.EventService.on(this.EventService.events.MODAL_OK, name => {
      if (name !== 'ADD_MOD') return;
      this.isLoading = true;
      this.ModService.create(this.BranchService.branch.id, this.data.username)
        .then(() => this.$timeout(() => {
          this.data = {};
          this.errorMessage = '';
          this.isLoading = false;
          this.ModalService.OK();
        }))
        .catch(response => this.$timeout(() => {
          this.data = {};
          this.errorMessage = response.message;
          if (response.status === 404) {
            this.errorMessage = 'That user doesn\'t exist';
          }
          this.isLoading = false;
        }));
    }));

    listeners.push(this.EventService.on(this.EventService.events.MODAL_CANCEL, name => {
      if (name !== 'ADD_MOD') return;
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

AddModModalController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'BranchService',
  'EventService',
  'ModalService',
  'ModService',
];

export default AddModModalController;
