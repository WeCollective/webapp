import Injectable from 'utils/injectable';

class SubmitPollAnswerModalController extends Injectable {
  constructor(...injections) {
    super(SubmitPollAnswerModalController.$inject, injections);

    this.errorMessage = '';
    this.isLoading = false;
    this.newAnswer = '';

    this.cleanUpSuccessCb = this.EventService.on(this.EventService.events.MODAL_OK, name => {
      if (name !== 'SUBMIT_POLL_ANSWER') return;

      this.PostService
        .createPollAnswer(this.ModalService.inputArgs.postid, { text: this.newAnswer })
        .then(() => this.$timeout(() => this.closeModal('', true)))
        .catch(err => this.$timeout(() => this.closeModal(err.message || 'Error creating poll answer!')));
    });

    this.cleanUpCancelCb = this.EventService.on(this.EventService.events.MODAL_CANCEL, name => {
      if (name !== 'SUBMIT_POLL_ANSWER') return;
      this.$timeout(() => this.closeModal('', false));
    });
  }

  closeModal(errorMessage, success) {
    this.isLoading = false;
    this.errorMessage = errorMessage;

    if (success !== undefined) {
      if (typeof this.cleanUpCancelCb === 'function') {
        this.cleanUpCancelCb();
      }

      if (typeof this.cleanUpSuccessCb === 'function') {
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
