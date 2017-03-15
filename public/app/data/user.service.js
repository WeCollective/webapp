import Injectable from 'utils/injectable';
import Generator from 'utils/generator';

class UserService extends Injectable {
  constructor(...injections) {
    super(UserService.$inject, injections);

    this.user = {};
  }
  isAuthenticated() {
    return !!this.user && Object.keys(this.user).length > 0;
  }
  fetch(username) {
    return new Promise(function(resolve, reject) {
      Generator.run(function* (self) {
        let user = yield self.API.fetch('/user/:username', {
          username: username
        });
      }, this);
    }.bind(this));
  }
}
UserService.$inject = ['API', 'ENV'];

export default UserService;
