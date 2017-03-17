import Injectable from 'utils/injectable';

class AuthController extends Injectable {
  constructor(...injections) {
    super(AuthController.$inject, injections);

    this.credentials = {};
    this.isLoading = false;
    this.loopAnimation = false;
    this.errorMessage = '';
    this.showResendVerification = false;
    this.animationSrc = '/assets/images/logo-animation-large.gif';
  }

  isLoginForm() { return this.$state.current.name === 'auth.login'; }

  submit() {
    this.isLoading = true;
    this.loopAnimation = true;
    this.triggerAnimation();
    this.credentials.username = this.credentials.username.toLowerCase();
    if(this.isLoginForm()) {
      this.login();
    } else {
      this.signup();
    }
  }

  login() {
    this.UserService.login(this.credentials).then(() => {
      this.isLoading = false;
      this.loopAnimation = false;
      this.$state.go('weco.home');
    }).catch((response) => {
      this.errorMessage = response.message;
      this.isLoading = false;
      this.loopAnimation = false;

      // forbidden implies possibly unverified account
      if(response.status === 403) {
        this.showResendVerification = true;
      }
    });
  }

  signup() {
    if(this.credentials.password !== this.credentials.confirmPassword) {
      this.errorMessage = 'Inconsistent password!';
      this.isLoading = false;
      this.loopAnimation = false;
      return;
    }

    this.UserService.signup(this.credentials).then(() => {
      this.isLoading = false;
      this.loopAnimation = false;
      this.$state.go('weco.home');
      this.AlertsService.push('success', 'Check your inbox to verify your account!', true);
    }).catch((response) => {
      this.errorMessage = response.message;
      this.isLoading = false;
      this.loopAnimation = false;
    });
  }

  resendVerification() {
    this.isLoading = true;
    this.UserService.resendVerification(this.credentials.username).then(() => {
      this.AlertsService.push('success', 'Verification email sent. Keep an eye on your inbox!', true);
      this.errorMessage = '';
      this.isLoading = false;
      this.showResendVerification = false;
    }).catch(() => {
      this.AlertsService.push('error', 'Unable to resend verification email!', true);
      this.errorMessage = '';
      this.isLoading = false;
      this.showResendVerification = false;
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

  getAnimationSrc() {
    return this.animationSrc;
  }
}
AuthController.$inject = ['$state', '$timeout', 'UserService', 'AlertsService'];

export default AuthController;
