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

  login(credentials) {
    return new Promise(function(resolve, reject) {
      Generator.run(function* (self) {
        try {
          yield self.API.request('POST', '/user/login', {}, credentials);
          resolve();
        } catch(response) { return reject(response.data || response); }
      }, this);
    }.bind(this));
  }

  fetch(username) {
    return new Promise(function(resolve, reject) {
      Generator.run(function* (self) {
        try {
          let user = yield self.API.fetch('/user/:username', {
            username: username
          });
          return resolve(user);
        } catch(response) { return reject(response.data || response); }
      }, this);
    }.bind(this));
  }
}
UserService.$inject = ['API', 'ENV'];

export default UserService;
