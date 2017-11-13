import Injectable from 'utils/injectable';

class BanUserModalController extends Injectable {
  constructor(...injections) {
    super(BanUserModalController.$inject, injections);

    this.data = {};
    this.errorMessage = '';
    this.isLoading = false;

    const listeners = [];

    listeners.push(this.EventService.on(this.EventService.events.MODAL_OK, name => {
      if (name !== 'BAN_USER') return;

      // Username cannot be empty.
      if (!this.data || !this.data.username) {
        this.$timeout(() => { this.errorMessage = 'Username cannot be empty'; });
        return;
      }

      this.isLoading = true;
      this.UserService.ban(this.data.username)
        .then(() => this.$timeout(() => {
          this.data = {};
          this.errorMessage = '';
          this.isLoading = false;
          this.ModalService.OK();
        }))
        .catch(err => this.$timeout(() => {
          this.errorMessage = err.message;
          this.isLoading = false;
        }));
    }));

    listeners.push(this.EventService.on(this.EventService.events.MODAL_CANCEL, name => {
      if (name !== 'BAN_USER') return;
      this.$timeout(() => {
        this.data = {};
        this.errorMessage = '';
        this.isLoading = false;
        this.ModalService.Cancel();
      });
    }));

    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }
}

BanUserModalController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'EventService',
  'ModalService',
  'UserService',
];

export default BanUserModalController;
