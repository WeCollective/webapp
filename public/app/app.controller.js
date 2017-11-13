import Injectable from 'utils/injectable';

class AppController extends Injectable {
  constructor(...injections) {
    super(AppController.$inject, injections);

    this.socketioURL = `${this.ENV.apiEndpoint}socket.io/socket.io.js`;
  }

  hasNavBar() {
    if (this.$state.current.name.includes('auth') ||
       this.$state.current.name.includes('verify') ||
       this.$state.current.name.includes('reset-password')) {
      return false;
    }

    return true;
  }
}

AppController.$inject = [
  '$state',
  'ENV',
  'TooltipService',
];

export default AppController;
