import Injectable from 'utils/injectable';

class ModalService extends Injectable {
  constructor(...injections) {
    super(ModalService.$inject, injections);

    this.templateUrl = '';
    this.isOpen = false;
    this.modalInputArgs = {};
    this.modalOutputArgs = {};
    this.modalResolve = () => {};
    this.modalReject = () => {};
  }

  open(url, args) {
    // force change the template url so that controllers included on
    // the template are reloaded
    this.templateUrl = '';
    this.$timeout(() => { this.templateUrl = url; });

    this.isOpen = true;
    this.modalInputArgs = args;
    return new Promise((resolve, reject) => {
      this.modalResolve = resolve;
      this.modalReject = reject;
    });
  }

  OK(args) {
    this.$timeout(() => {
      this.isOpen = false;
      if(args) {
        this.modalOutputArgs = args;
      }
      this.modalResolve(true);
    });
  }

  Cancel(args) {
    this.$timeout(() => {
      this.isOpen = false;
      if(args) {
        this.modalOutputArgs = args;
      }
      this.modalResolve(false);
    });
  }

  Error() {
    this.modalReject();
  }
}
ModalService.$inject = ['$timeout'];

export default ModalService;
