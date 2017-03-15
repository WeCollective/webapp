import Injectable from 'utils/injectable.js';

class AppController extends Injectable {
  constructor(...injections) {
    super(AppController.$inject, injections);

    this.socketioURL = this.ENV.apiEndpoint + 'socket.io/socket.io.js';
    this.UserService.fetch('me').then(function(me) {
      console.log("RESOLVE", me);
    }).catch(function() {
      console.log("ERROR");
    });
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
AppController.$inject = ['$state', 'ENV', 'UserService'];

export default AppController;
