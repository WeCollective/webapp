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
  }

  getAnimationSrc() {
    return this.animationSrc;
  }

  isLoginForm() {
    return 'auth.login' === this.$state.current.name;
  }

  login() {
    this.UserService.login(this.credentials)
      .then( () => {
        this.isLoading = false;
        this.loopAnimation = false;
        this.$state.go('weco.home');
      })
      .catch( res => {
        this.errorMessage = res.message;
        this.isLoading = false;
        this.loopAnimation = false;

        // Possibly unverified account
        if (res.status === 403) {
          this.showResendVerification = true;
        }
      });
  }

  resendVerification() {
    this.isLoading = true;

    this.UserService.resendVerification(this.credentials.username)
      .then( () => {
        this.resendVerificationDone(true)
      })
      .catch( () => {
        this.resendVerificationDone(false)
      });
  }

  resendVerificationDone(success) {
    const alertMsg = success ? 'Verification email sent. Keep an eye on your inbox!' : 'Unable to resend verification email!';
    this.AlertsService.push(success ? 'success' : 'error', alertMsg, true);
    
    this.errorMessage = '';
    this.isLoading = false;
    this.showResendVerification = false;
  }

  signup() {
    if (this.credentials.password !== this.credentials.confirmPassword) {
      this.errorMessage = 'Inconsistent password!';
      this.isLoading = false;
      this.loopAnimation = false;
      return;
    }

    this.UserService.signup(this.credentials)
      .then( () => {
        this.AlertsService.push('success', 'Check your inbox to verify your account!', true);
        this.isLoading = false;
        this.loopAnimation = false;
        this.$state.go('weco.home');
      })
      .catch( res => {
        this.errorMessage = res.message;
        this.isLoading = false;
        this.loopAnimation = false;
      });
  }

  submit() {
    this.isLoading = true;
    this.loopAnimation = true;
    this.triggerAnimation();
    this.credentials.username = this.credentials.username.toLowerCase();
    
    if (this.isLoginForm()) {
      this.login();
    } else {
      this.signup();
    }
  }

  triggerAnimation() {
    if (this.animationSrc) {
      this.$timeout( () => {
        this.animationSrc = '';
      });
    }

    // set animation src to the animated gif
    this.$timeout( () => {
      this.animationSrc = '/assets/images/logo-animation-large.gif';
    });

    // cancel after 1 sec
    this.$timeout( () => {
      this.animationSrc = '';
      
      if (this.loopAnimation) {
        this.triggerAnimation();
      }
    }, 1000);
  }
}

AuthController.$inject = [
  '$state',
  '$timeout',
  'AlertsService',
  'UserService'
];

export default AuthController;