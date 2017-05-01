import Injectable from 'utils/injectable.js';

class SubmitPollAnswerModalController extends Injectable {
  constructor(...injections) {
    super(SubmitPollAnswerModalController.$inject, injections);

    this.errorMessage = '';
    this.isLoading = false;
    this.newAnswer = '';

    this.EventService.on(this.EventService.events.MODAL_OK, (name) => {
      if(name !== 'SUBMIT_POLL_ANSWER') return;

    });

    this.EventService.on(this.EventService.events.MODAL_CANCEL, (name) => {
      if(name !== 'SUBMIT_POLL_ANSWER') return;
      this.$timeout(() => {
        this.errorMessage = '';
        this.isLoading = false;
        this.ModalService.Cancel();
      });
    });
  }
}
SubmitPollAnswerModalController.$inject = ['$timeout', 'EventService', 'ModalService'];

export default SubmitPollAnswerModalController;
