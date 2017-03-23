import Injectable from 'utils/injectable';

class ModalService extends Injectable {
  constructor(...injections) {
    super(ModalService.$inject, injections);

    this.templateUrl = '';
    this.isOpen = false;
    this.inputArgs = {};
    this.outputArgs = {};
    this.resolve = () => {};
    this.reject = () => {};
  }

  open(url, args, successMessage, errorMessage) {
    // force change the template url so that controllers included on
    // the template are reloaded
    this.templateUrl = url;
    this.$timeout(() => { this.templateUrl = url; });
    this.isOpen = true;
    this.inputArgs = args;
    this.EventService.emit(this.EventService.events.MODAL_OPEN);

    new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    }).then((result) => {
      // force reload if OK was pressed
      if(result) {
        this.$state.go(this.$state.current, {}, { reload: true });
        this.AlertsService.push('success', successMessage);
      }
    }).catch((err) => {
      this.AlertsService.push('error', errorMessage);
    });
  }

  OK(args) {
    this.$timeout(() => {
      this.isOpen = false;
      if(args) {
        this.outputArgs = args;
      }
      this.resolve(true);
    });
  }

  Cancel(args) {
    this.$timeout(() => {
      this.isOpen = false;
      if(args) {
        this.outputArgs = args;
      }
      this.resolve(false);
    });
  }

  Error() {
    this.reject();
  }
}
ModalService.$inject = ['$timeout', '$state', 'EventService', 'AlertsService'];

export default ModalService;
