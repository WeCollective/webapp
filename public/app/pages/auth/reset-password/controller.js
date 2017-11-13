import Injectable from 'utils/injectable';

class ResetPasswordController extends Injectable {
  constructor (...injections) {
    super(ResetPasswordController.$inject, injections);

    this.animationSrc = '/assets/images/logo-animation-large.gif';
    this.credentials = {};
    this.errorMessage = '';
    this.isLoading = false;
    this.loopAnimation = false;
  }

  resetPassword () {
    this.startAnimation();

    if (this.credentials.password !== this.credentials.confirmPassword) {
      this.stopAnimation();
      this.AlertsService.push('error', 'The two passwords are different.');
      return;
    }

    this.UserService.resetPassword(this.$state.params.username, this.credentials.password, this.$state.params.token)
      .then(_ => {
        this.stopAnimation();
        this.AlertsService.push('success', 'Successfully updated password! You can now login.', true);
        this.$state.go('auth.login');
      })
      .catch(err => this.$timeout(_ => this.stopAnimation(err.message)));
  }

  sendLink () {
    this.startAnimation();

    this.UserService.requestResetPassword(this.credentials.username)
      .then(_ => {
        this.stopAnimation();
        this.AlertsService.push('success', 'A password reset link has been sent to your inbox.', true);
        this.$state.go('weco.home');
      })
      .catch(err => this.$timeout(_ => this.stopAnimation(err.message)));
  }

  startAnimation () {
    this.isLoading = true;
    this.loopAnimation = true;
    this.triggerAnimation();
  }

  stopAnimation (errorMessage) {
    if (errorMessage) {
      this.errorMessage = errorMessage;
    }
    
    this.isLoading = false;
    this.loopAnimation = false;
  }

  triggerAnimation () {
    if (this.animationSrc !== '') {
      this.$timeout(_ => this.animationSrc = '');
    }

    // set animation src to the animated gif
    this.$timeout(_ => this.animationSrc = '/assets/images/logo-animation-large.gif');
    
    // cancel after 1 sec
    this.$timeout(_ => {
      this.animationSrc = '';
      
      if (this.loopAnimation) {
        this.triggerAnimation();
      }
    }, 1000);
  }
}

ResetPasswordController.$inject = [
  '$state',
  '$timeout',
  'AlertsService',
  'UserService'
];

export default ResetPasswordController;
