import Injectable from 'utils/injectable.js';
import Generator from 'utils/generator.js';

class DeletePostModalController extends Injectable {
  constructor(...injections) {
    super(DeletePostModalController.$inject, injections);

    this.errorMessage = '';
    this.isLoading = false;

    this.EventService.on(this.EventService.events.MODAL_OK, (name) => {
      if(name !== 'DELETE_POST') return;
      this.isLoading = true;
      this.PostService.delete(this.ModalService.inputArgs.postid).then(() => {
        this.isLoading = false;
        this.ModalService.OK();
      }).catch((err) => {
        this.isLoading = false;
        this.ModalService.Cancel();
      });
    });

    this.EventService.on(this.EventService.events.MODAL_CANCEL, (name) => {
      if(name !== 'DELETE_POST') return;
      this.$timeout(() => {
        this.errorMessage = '';
        this.isLoading = false;
        this.ModalService.Cancel();
      });
    });
  }
}
DeletePostModalController.$inject = ['$timeout', 'EventService', 'PostService', 'AlertsService', 'ModalService'];

export default DeletePostModalController;
