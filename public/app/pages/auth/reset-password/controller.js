import Injectable from 'utils/injectable';

class ResetPasswordController extends Injectable {
  constructor(...injections) {
    super(ResetPasswordController.$inject, injections);

    this.errorMessage = '';
    this.isLoading = false;
    this.loopAnimation = false;
    this.credentials = {};
    this.animationSrc = '/assets/images/logo-animation-large.gif';
  }

  resetPassword() {
    this.isLoading = true;
    this.loopAnimation = true;
    this.triggerAnimation();

    if(this.credentials.password !== this.credentials.confirmPassword) {
      this.AlertsService.push('error', 'The two passwords are different.');
      this.isLoading = false;
      this.loopAnimation = false;
      return;
    }

    this.UserService.resetPassword(
      this.$state.params.username,
      this.credentials.password,
      this.$state.params.token
    ).then(() => {
      this.AlertsService.push('success', 'Successfully updated password! You can now login.', true);
      this.isLoading = false;
      this.loopAnimation = false;
      this.$state.go('auth.login');
    }).catch((response) => {
      this.$timeout(() => {
        this.errorMessage = response.message;
        this.isLoading = false;
        this.loopAnimation = false;
      });
    });
  }

  sendLink() {
    this.isLoading = true;
    this.loopAnimation = true;
    this.triggerAnimation();

    this.UserService.requestResetPassword(this.credentials.username).then(() => {
      this.$state.go('weco.home');
      this.isLoading = false;
      this.loopAnimation = false;
      this.AlertsService.push('success', 'A password reset link has been sent to your inbox.', true);
    }).catch((response) => {
      this.isLoading = false;
      this.errorMessage = response.message;
      this.loopAnimation = false;
    });
  }

  triggerAnimation() {
    if(this.animationSrc !== '') {
      this.$timeout(() => { this.animationSrc = ''; });
    }
    // set animation src to the animated gif
    this.$timeout(() => { this.animationSrc = '/assets/images/logo-animation-large.gif'; });
    // cancel after 1 sec
    this.$timeout(() => {
      this.animationSrc = '';
      if(this.loopAnimation) this.triggerAnimation();
    }, 1000);
  }
}
ResetPasswordController.$inject = ['$state', '$timeout', 'UserService', 'AlertsService'];

export default ResetPasswordController;
