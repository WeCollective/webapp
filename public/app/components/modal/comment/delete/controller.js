import Injectable from 'utils/injectable';

class DeleteCommentModalController extends Injectable {
  constructor (...injections) {
    super(DeleteCommentModalController.$inject, injections);

    this.errorMessage = '';
    this.isLoading = false;

    this.EventService.on(this.EventService.events.MODAL_OK, name => {
      if (name !== 'DELETE_COMMENT') return;

      const params = this.ModalService.inputArgs;
      
      this.isLoading = true;

      this.CommentService.delete(params.postid, params.commentid)
        .then(() => {
          this.isLoading = false;
          this.ModalService.OK();
        })
        .catch(() => {
          this.isLoading = false;
          this.ModalService.Cancel();
        });
    });

    this.EventService.on(this.EventService.events.MODAL_CANCEL, name => {
      if (name !== 'DELETE_COMMENT') return;
      
      this.$timeout( () => {
        this.errorMessage = '';
        this.isLoading = false;
        this.ModalService.Cancel();
      });
    });
  }
}

DeleteCommentModalController.$inject = [
  '$timeout',
  'AlertsService',
  'CommentService',
  'EventService',
  'ModalService',
];

export default DeleteCommentModalController;
