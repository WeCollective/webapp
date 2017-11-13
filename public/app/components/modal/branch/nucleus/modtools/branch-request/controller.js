import Injectable from 'utils/injectable';

class SubmitSubbranchRequestModalController extends Injectable {
  constructor(...injections) {
    super(SubmitSubbranchRequestModalController.$inject, injections);

    this.handleModalCancel = this.handleModalCancel.bind(this);
    this.handleModalSubmit = this.handleModalSubmit.bind(this);

    this.data = {};
    this.errorMessage = '';
    this.isLoading = false;

    const { events } = this.EventService;
    const listeners = [];
    listeners.push(this.EventService.on(events.MODAL_CANCEL, this.handleModalCancel));
    listeners.push(this.EventService.on(events.MODAL_OK, this.handleModalSubmit));
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  handleModalCancel(name) {
    if (name !== 'SUBMIT_SUBBRANCH_REQUEST') return;

    this.$timeout(() => {
      this.data = {};
      this.errorMessage = '';
      this.isLoading = false;
      this.ModalService.Cancel();
    });
  }

  handleModalSubmit(name) {
    if (name !== 'SUBMIT_SUBBRANCH_REQUEST') return;
    this.isLoading = true;

    if (!this.data || !this.data.parentid) {
      this.$timeout(() => this.errorMessage = 'Please fill in all fields');
      return;
    }

    const params = Object.assign({}, this.data);

    this.BranchService.submitSubbranchRequest(params.parentid, this.ModalService.inputArgs.branchid)
      .then(() => this.$timeout(() => {
        this.isLoading = false;
        this.data = {};
        this.errorMessage = '';
        this.ModalService.OK(params);
      }))
      .catch(error => this.$timeout(() => {
        this.isLoading = false;
        this.errorMessage = error.message;
      }));
  }
}

SubmitSubbranchRequestModalController.$inject = [
  '$scope',
  '$timeout',
  'BranchService',
  'EventService',
  'ModalService',
];

export default SubmitSubbranchRequestModalController;
