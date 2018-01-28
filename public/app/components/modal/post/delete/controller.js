import Injectable from 'utils/injectable';

class DeletePostModalController extends Injectable {
  constructor(...injections) {
    super(DeletePostModalController.$inject, injections);

    this.errorMessage = '';
    this.isLoading = false;

    const listeners = [];

    listeners.push(this.EventService.on(this.EventService.events.MODAL_OK, name => {
      if (name !== 'DELETE_POST') return;

      this.ModalService.disabled = true;

      const { id } = this.BranchService.branch;
      const { name: stateName } = this.$state.current;
      // Redirect so we won't see the 404 message.
      if (stateName.includes('weco.branch.post')) {
        this.$state.go('weco.branch.wall', { branchid: id });
      }

      this.isLoading = true;
      this.PostService.delete(this.ModalService.inputArgs.postid)
        .then(() => {
          this.isLoading = false;
          this.ModalService.disabled = false;
          this.ModalService.OK();
        })
        .catch(() => {
          this.isLoading = false;
          this.ModalService.disabled = false;
          this.ModalService.Cancel();
        });
    }));

    listeners.push(this.EventService.on(this.EventService.events.MODAL_CANCEL, name => {
      if (name !== 'DELETE_POST') return;

      this.$timeout(() => {
        this.errorMessage = '';
        this.isLoading = false;
        this.ModalService.Cancel();
      });
    }));

    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }
}

DeletePostModalController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'BranchService',
  'EventService',
  'ModalService',
  'PostService',
];

export default DeletePostModalController;
