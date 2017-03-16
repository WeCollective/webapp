import Injectable from 'utils/injectable';
import Generator from 'utils/generator';

class UserService extends Injectable {
  constructor(...injections) {
    super(UserService.$inject, injections);
    this.user = {};
    this.fetch('me').then((user) => {
      this.user = user;
    })
    .catch(() => {})
    .then(this.$timeout);
  }

  isAuthenticated() {
    return !!this.user && Object.keys(this.user).length > 0;
  }

  login(credentials) {
    return new Promise(function(resolve, reject) {
      Generator.run(function* (self) {
        try {
          yield self.API.request('POST', '/user/login', {}, credentials);
          let user = yield self.fetch('me');
          self.user = user;
          resolve();
        } catch(response) { return reject(response.data || response); }
      }, this);
    }.bind(this));
  }

  logout() {
    return new Promise(function(resolve, reject) {
      this.API.request('GET', '/user/logout', {}).then(() => {
        this.user = {};
        resolve();
      }).catch((response) => { reject(response); });
    }.bind(this));
  }

  signup(credentials) {
    return new Promise(function(resolve, reject) {
      this.API.request('POST', '/user', {}, credentials)
        .then(resolve)
        .catch((response) => {
          return reject(response.data || response);
        }
      );
    }.bind(this));
  }

  fetch(username) {
    return new Promise(function(resolve, reject) {
      Generator.run(function* (self) {
        try {
          // fetch the user
          let response = yield self.API.fetch('/user/:username', { username: username });
          let user = response.data;

          try {
            // attach urls for the user's profile and cover pictures (inc. thumbnails)
            response = yield self.API.fetch('/user/me/:picture', { picture: 'picture' });
            user.profileUrl = response.data;
            response = yield self.API.fetch('/user/me/:picture', { picture: 'picture-thumb' });
            user.profileUrlThumb = response.data;
            response = yield self.API.fetch('/user/me/:picture', { picture: 'cover' });
            user.coverUrl = response.data;
            response = yield self.API.fetch('/user/me/:picture', { picture: 'cover-thumb' });
            user.coverUrlThumb = response.data;
          } catch(err) { /* It's okay if we don't have any photos */ }

          return resolve(user);
        } catch(response) { return reject(response.data || response); }
      }, this);
    }.bind(this));
  }
}
UserService.$inject = ['API', 'ENV', '$timeout'];

export default UserService;
