import Injectable from 'utils/injectable';
import Generator from 'utils/generator';

class UserService extends Injectable {
  constructor(...injections) {
    super(UserService.$inject, injections);

    this.user = {};
  }
  fetch(username) {
    return new Promise(function(resolve, reject) {
      Generator.run(function* () {
        let user = yield this.API.fetch('/user/:username', {
          username: username
        });
        if(user) return resolve(user);
        return reject();
      });
    });
  }
}
UserService.$inject = ['API', 'ENV'];

export default UserService;
