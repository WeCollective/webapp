import Injectable from 'utils/injectable';

class SubmitPollAnswerModalController extends Injectable {
  constructor(...injections) {
    super(SubmitPollAnswerModalController.$inject, injections);

    this.errorMessage = '';
    this.isLoading = false;
    this.newAnswer = '';

    this.cleanUpSuccessCb = this.EventService.on(this.EventService.events.MODAL_OK, name => {
      if ('SUBMIT_POLL_ANSWER' !== name) return;

      this.PostService.createPollAnswer(this.ModalService.inputArgs.postid, { text: this.newAnswer })
        .then(() => this.$timeout(() => this.closeModal('', true) ))
        .catch( err => this.$timeout(() => this.closeModal(err.message || 'Error creating poll answer!') ));
    });

    this.cleanUpCancelCb = this.EventService.on(this.EventService.events.MODAL_CANCEL, name => {
      if ('SUBMIT_POLL_ANSWER' !== name) return;
      this.$timeout(() => this.closeModal('', false) );
    });
  }

  closeModal (errorMessage, success) {
    this.isLoading = false;
    this.errorMessage = errorMessage;

    if (success !== undefined) {
      if ('function' === typeof this.cleanUpCancelCb) {
        this.cleanUpCancelCb();
      }

      if ('function' === typeof this.cleanUpSuccessCb) {
        this.cleanUpSuccessCb();
      }
    }

    if (success === true) {
      this.ModalService.OK();
    }
    else if (success === false) {
      this.ModalService.Cancel();
    }
  }
}

SubmitPollAnswerModalController.$inject = [
  '$timeout',
  'EventService',
  'ModalService',
  'PostService',
];

export default SubmitPollAnswerModalController;