import Injectable from 'utils/injectable';

class VerifyController extends Injectable {
  constructor(...injections) {
    super(VerifyController.$inject, injections);

    const defaultMessage = 'Verifying your account';
    this.message = defaultMessage;

    this.$interval(() => {
      // Animates the dots.
      this.message = this.message.includes('...') ? defaultMessage : `${this.message}.`;
    }, 1000);

    this.$timeout(() => {
      this.UserService.verify(this.$state.params.username, this.$state.params.token)
        .then(() => {
          this.AlertsService.push('success', 'Account verified! You can now login.', true);
          this.$state.go('auth.login');
        })
        .catch(() => {
          this.AlertsService.push('error', 'Unable to verify your account. Your token may have expired: try signing up again.', true);
          this.$state.go('auth.signup');
        });
    }, 3000);
  }
}

VerifyController.$inject = [
  '$interval',
  '$state',
  '$timeout',
  'AlertsService',
  'UserService',
];

export default VerifyController;
