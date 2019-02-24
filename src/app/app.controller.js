import Injectable from 'utils/injectable';

class AppController extends Injectable {
  constructor(...injections) {
    super(AppController.$inject, injections);
    this.socketioURL = `${this.ENV.apiEndpoint}socket.io/socket.io.js`;
  }

  hasNavBar() {
    const { name } = this.$state.current;
    return !(name.includes('auth') || name.includes('verify') || name.includes('reset-password'));
  }
}

AppController.$inject = [
  '$state',
  'ENV',
  'TooltipService',
];

export default AppController;
