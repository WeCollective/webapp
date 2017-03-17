import Injectable from 'utils/injectable';

class VerifyController extends Injectable {
  constructor(...injections) {
    super(VerifyController.$inject, injections);

    this.message = 'Verifying your account';
    this.animationSrc = '/assets/images/logo-animation-large.gif';

    this.$interval(() => {
      if(this.animationSrc !== '') {
        this.$timeout(() => { this.animationSrc = ''; });
      }
      // set animation src to the animated gif
      this.$timeout(() => { this.animationSrc = '/assets/images/logo-animation-large.gif'; });

      if(this.message.indexOf('...') > -1) {
        this.message = 'Verifying your account.';
      } else {
        this.message += '.';
      }
    }, 1000);

    this.$timeout(() => {
      this.UserService.verify(this.$state.params.username, this.$state.params.token).then(() => {
        this.$state.go('auth.login');
        this.AlertsService.push('success', 'Account verified! You can now login.', true);
      }).catch((err) => {
        this.AlertsService.push('error', 'Unable to verify your account. Your token may have expired: try signing up again.', true);
        this.$state.go('auth.signup');
      });
    }, 3000);
  }
}
VerifyController.$inject = ['$state', '$interval', '$timeout', 'UserService', 'AlertsService'];

export default VerifyController;
