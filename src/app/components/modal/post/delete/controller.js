import Injectable from 'utils/injectable';

class DeletePostModalController extends Injectable {
  constructor(...injections) {
    super(DeletePostModalController.$inject, injections);

    this.errorMessage = '';
    this.isLoading = false;

    const listeners = [];

    listeners.push(this.EventService.on(this.EventService.events.MODAL_OK, name => {
      if (name !== 'DELETE_POST') return;

      this.isLoading = true;

      this.PostService.delete(this.ModalService.inputArgs.postid)
        .then(() => {
          this.isLoading = false;
          this.ModalService.OK();
        })
        .catch(() => {
          this.isLoading = false;
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
  '$timeout',
  'EventService',
  'ModalService',
  'PostService',
];

export default DeletePostModalController;
