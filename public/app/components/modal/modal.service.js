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

  open(url, args) {
    // force change the template url so that controllers included on
    // the template are reloaded
    this.templateUrl = url;
    this.$timeout(() => { this.templateUrl = url; });

    this.isOpen = true;
    this.inputArgs = args;
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
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
ModalService.$inject = ['$timeout'];

export default ModalService;
