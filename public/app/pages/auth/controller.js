import Injectable from 'utils/injectable';

class AuthController extends Injectable {
  constructor(...injections) {
    super(AuthController.$inject, injections);

    this.animationSrc = '/assets/images/logo-animation-large.gif';
    this.credentials = {};
    this.errorMessage = '';
    this.isLoading = false;
    this.loopAnimation = false;
    this.showResendVerification = false;

    // Force lowercase username.
    this.$scope.$watch(() => this.credentials.username, value => {
      if (!value) return;
      const low = value.toLowerCase();
      if (low !== value) {
        this.credentials.username = low;
      }
    });
  }

  getAnimationSrc() {
    return this.animationSrc;
  }

  isLoginForm() {
    return this.$state.current.name === 'auth.login';
  }

  login() {
    this.UserService.login(this.credentials)
      .then(() => {
        this.stopAnimation();
        this.$state.go('weco.home');
      })
      .catch(err => {
        this.stopAnimation(err.message);

        // Possibly unverified account
        if (err.status === 403) {
          this.showResendVerification = true;
        }
      });
  }

  resendVerification() {
    this.isLoading = true;

    this.UserService.resendVerification(this.credentials.username)
      .then(() => this.resendVerificationDone(true))
      .catch(() => this.resendVerificationDone(false));
  }

  resendVerificationDone(success) {
    const alertMsg = success ? 'Verification email sent. Keep an eye on your inbox!' : 'Unable to resend verification email!';
    this.AlertsService.push(success ? 'success' : 'error', alertMsg, true);

    this.errorMessage = '';
    this.isLoading = false;
    this.showResendVerification = false;
  }

  signup() {
    this.UserService.signup(this.credentials)
      .then(() => {
        this.stopAnimation();
        this.AlertsService.push('success', 'Check your inbox to verify your account!', true);
        this.$state.go('weco.home');
      })
      .catch(err => this.stopAnimation(err.message));
  }

  stopAnimation(errorMessage) {
    if (errorMessage !== undefined) {
      this.errorMessage = errorMessage;
    }

    this.isLoading = false;
    this.loopAnimation = false;
  }

  submit() {
    this.isLoading = true;
    this.loopAnimation = true;
    this.triggerAnimation();
    this.credentials.username = this.credentials.username.toLowerCase();

    if (this.isLoginForm()) {
      this.login();
    }
    else {
      this.signup();
    }
  }

  triggerAnimation() {
    if (this.animationSrc) {
      this.$timeout(() => this.animationSrc = '');
    }

    // set animation src to the animated gif
    this.$timeout(() => this.animationSrc = '/assets/images/logo-animation-large.gif');

    // cancel after 1 sec
    this.$timeout(() => {
      this.animationSrc = '';

      if (this.loopAnimation) {
        this.triggerAnimation();
      }
    }, 1000);
  }
}

AuthController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'AlertsService',
  'UserService',
];

export default AuthController;
