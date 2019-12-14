import Injectable from 'utils/injectable';

class AuthController extends Injectable {
  constructor(...injections) {
    super(AuthController.$inject, injections);

    this.credentials = {};
    this.errorMessage = '';
    this.isLoading = false;
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

  clearError() {
    this.$timeout(() => {
      this.errorMessage = '';
    });
  }

  isLoginForm() {
    return this.$state.current.name === 'auth.login';
  }

  login() {
    this.UserService.login(this.credentials)
      .then(() => this.$timeout(() => {
        this.isLoading = false;
        this.$state.go('weco.home');
      }))
      .catch(err => this.$timeout(() => {
        this.isLoading = false;
        this.errorMessage = err.message;

        // Possibly unverified account
        if (err.status === 403) {
          this.showResendVerification = true;
        }
      }));
  }

  resendVerification() {
    this.isLoading = true;

    this.UserService.resendVerification(this.credentials.username)
      .then(() => this.resendVerificationDone(true))
      .catch(() => this.resendVerificationDone(false));
  }

  resendVerificationDone(success) {
    const alertMsg = success ? 'Verification email sent. Keep an eye on your inbox!' : 'Unable to resend verification email!';
    this.AlertsService.push(success ? 'success' : 'error', alertMsg);

    this.clearError();
    this.isLoading = false;
    this.showResendVerification = false;
  }

  signup() {
    this.UserService.signup(this.credentials)
      .then(() => this.$timeout(() => {
        this.isLoading = false;
        this.AlertsService.push('success', 'Check your inbox to verify your account!');
        this.$state.go('weco.home');
      }))
      .catch(err => this.$timeout(() => {
        this.isLoading = false;
        this.errorMessage = err.message;
      }));
  }

  submit() {
    this.isLoading = true;
    this.credentials.username = this.credentials.username.toLowerCase();

    if (this.isLoginForm()) {
      this.login();
    }
    else {
      this.signup();
    }
  }

  /*closeAuthPage() {
    var background = document.getElementsByClassName("auth-page")[0];
    
    if (event.target == background) {
      window.open("/b/root/wall","_self");
    }
  }*/
}

AuthController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'AlertsService',
  'UserService',
];

export default AuthController;
