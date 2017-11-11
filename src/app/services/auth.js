import Injectable from 'utils/injectable';

class Auth extends Injectable {
  constructor(...injections) {
    super(Auth.$inject, injections);

    this.jwt = window.localStorage.getItem('jwt') || '';
  }

  get() {
    return this.jwt;
  }

  save() {
    window.localStorage.setItem('jwt', this.jwt);
  }

  set(value) {
    this.jwt = value || '';
    this.save();
  }
}

Auth.$inject = [
  '$http',
  'ENV',
];

export default Auth;
