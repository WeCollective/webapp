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
    .then(this.$timeout)
    .then(() => {
      this.EventService.emit(this.EventService.events.CHANGE_USER);
    });
  }

  isAuthenticated() {
    return !!this.user && Object.keys(this.user).length > 0;
  }

  login(credentials) {
    return new Promise((resolve, reject) => {
      Generator.run(function* () {
        try {
          yield this.API.request('POST', '/user/login', {}, credentials, true);
          let user = yield this.fetch('me');
          this.user = user;
          this.EventService.emit(this.EventService.events.CHANGE_USER);
          resolve();
        } catch(response) { return reject(response.data || response); }
      }, this);
    });
  }

  logout() {
    return new Promise((resolve, reject) => {
      this.API.request('GET', '/user/logout', {}).then(() => {
        this.user = {};
        this.EventService.emit(this.EventService.events.CHANGE_USER);
        resolve();
      }).catch((response) => { reject(response); });
    });
  }

  signup(credentials) {
    return new Promise((resolve, reject) => {
      this.API.request('POST', '/user', {}, credentials)
        .then(resolve)
        .catch((response) => {
          return reject(response.data || response);
        }
      );
    });
  }

  // verify user account
  verify(username, token) {
    return new Promise((resolve, reject) => {
      this.API.request('GET', '/user/:username/verify/:token', {
        username: username,
        token: token
      })
      .then(resolve)
      .catch((response) => {
        return reject(response.data || response);
      });
    });
  }

  // resend the user verification email
  resendVerification(username) {
    return new Promise((resolve, reject) => {
      this.API.request('GET', '/user/:username/reverify', {
        username: username
      })
      .then(resolve)
      .catch((response) => {
        return reject(response.data || response);
      });
    });
  }

  // send a reset password link to the users inbox
  requestResetPassword(username) {
    return new Promise((resolve, reject) => {
      this.API.request('GET', '/user/:username/reset-password', {
        username: username
      })
      .then(resolve)
      .catch((response) => {
        return reject(response.data || response);
      });
    });
  }

  // send a reset password link to the users inbox
  resetPassword(username, password, token) {
    return new Promise((resolve, reject) => {
      this.API.request('POST', '/user/:username/reset-password/:token', {
        username: username,
        token: token
      }, {
        password: password
      })
      .then(resolve)
      .catch((response) => {
        return reject(response.data || response);
      });
    });
  }

  followBranch(username, branchid) {
    return new Promise((resolve, reject) => {
      this.API.save('/user/:username/branches/followed', {
        username: username
      }, {
        branchid: branchid
      }, true)
      .then(resolve)
      .catch((response) => {
        return reject(response.data || response);
      });
    });
  }

  unfollowBranch(username, branchid) {
    return new Promise((resolve, reject) => {
      this.API.delete('/user/:username/branches/followed', {
        username: username
      }, {
        branchid: branchid
      }, true)
      .then(resolve)
      .catch((response) => {
        return reject(response.data || response);
      });
    });
  }

  getNotifications(username, unreadCount, lastNotificationId) {
    return new Promise((resolve, reject) => {
      this.API.fetch('/user/:username/notifications', {
        username: username
      }, {
        unreadCount: unreadCount,
        lastNotificationId: lastNotificationId
      }).then((response) => {
        return resolve(response.data);
      }).catch((response) => {
        return reject(response.data || response);
      });
    });
  }

  markNotification(username, notificationid, unread) {
    return new Promise((resolve, reject) => {
      this.API.update('/user/:username/notifications/:notificationid', {
        username: username,
        notificationid: notificationid
      }, {
        unread: unread
      }, true).then(resolve).catch((response) => {
        return reject(response.data || response);
      });
    });
  }

  fetch(username) {
    return new Promise((resolve, reject) => {
      Generator.run(function* () {
        try {
          // fetch the user
          let response = yield this.API.fetch('/user/:username', { username: username });
          let user = response.data;

          try {
            // attach urls for the user's profile and cover pictures (inc. thumbnails)
            response = yield this.API.fetch('/user/:username/:picture', { username: username, picture: 'picture' });
            user.profileUrl = response.data;
          } catch(err) { /* It's okay if we don't have any photos */ }
          try {
            response = yield this.API.fetch('/user/:username/:picture', { username: username, picture: 'picture-thumb' });
            user.profileUrlThumb = response.data;
          } catch(err) { /* It's okay if we don't have any photos */ }
          try {
            response = yield this.API.fetch('/user/:username/:picture', { username: username, picture: 'cover' });
            user.coverUrl = response.data;
          } catch(err) { /* It's okay if we don't have any photos */ }
          try {
            response = yield this.API.fetch('/user/:username/:picture', { username: username, picture: 'cover-thumb' });
            user.coverUrlThumb = response.data;
          } catch(err) { /* It's okay if we don't have any photos */ }

          // attach user's followed branches
          response = yield this.API.fetch('/user/:username/branches/followed', { username: username });
          user.followed_branches = response.data;

          return resolve(user);
        } catch(response) { return reject(response.data || response); }
      }, this);
    });
  }

  update(data) {
    return new Promise((resolve, reject) => {
      Generator.run(function* () {
        try {
          // update self
          yield this.API.update('/user/me', {}, data, true);
          // fetch the updated self
          this.user = yield this.fetch('me');
          this.EventService.emit(this.EventService.events.CHANGE_USER);
          return resolve();
        } catch(response) { return reject(response.data || response); }
      }, this);
    });
  }
}
UserService.$inject = ['API', 'ENV', '$timeout', 'EventService'];

export default UserService;
