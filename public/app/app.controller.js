import Injectable from 'utils/injectable.js';

class AppController extends Injectable {
  constructor(...injections) {
    super(AppController.$inject, injections);

    this.socketioURL = this.ENV.apiEndpoint + 'socket.io/socket.io.js';
  }
  hasNavBar() {
    if(this.$state.current.name.indexOf('auth') > -1 ||
       this.$state.current.name.indexOf('verify') > -1 ||
       this.$state.current.name.indexOf('reset-password') > -1) {
      return false;
    } else {
      return true;
    }
  }
}
AppController.$inject = ['$state', 'ENV', 'TooltipService'];

export default AppController;
