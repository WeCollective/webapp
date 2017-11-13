import Injectable from 'utils/injectable';

class VerifyController extends Injectable {
  constructor (...injections) {
    super(VerifyController.$inject, injections);

    this.animationSrc = '/assets/images/logo-animation-large.gif';
    this.message = 'Verifying your account';

    this.$interval(_ => {
      if (this.animationSrc !== '') {
        this.$timeout(_ => this.animationSrc = '');
      }

      // set animation src to the animated gif
      this.$timeout(_ => this.animationSrc = '/assets/images/logo-animation-large.gif');

      this.message = this.message.includes('...') ? 'Verifying your account.' : `${this.message}.`;
    }, 1000);

    this.$timeout(_ => {
      this.UserService.verify(this.$state.params.username, this.$state.params.token)
        .then(_ => {
          this.AlertsService.push('success', 'Account verified! You can now login.', true);
          this.$state.go('auth.login');
        })
        .catch(_ => {
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
  'UserService'
];

export default VerifyController;
