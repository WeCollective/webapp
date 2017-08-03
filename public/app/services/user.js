import Generator from 'utils/generator';
import Injectable from 'utils/injectable';
import Validator from 'utils/validator';

class UserService extends Injectable {
  constructor(...injections) {
    super(UserService.$inject, injections);

    this.user = {};

    this.fetch('me')
      .then(user => this.set(user))
      .catch(() => this.$timeout(() => {
        this.EventService.emit(this.EventService.events.CHANGE_USER);
      }, 500));
  }

  fetch(username) {
    return new Promise((resolve, reject) => {
      this.API.get('/user/:username', { username })
        .then(res => resolve(res.data || res))
        .catch(err => reject(err.data || err));
    });
  }

  followBranch(username, branchid) {
    return new Promise((resolve, reject) => {
      this.API.post('/user/:username/branches/followed', { username }, { branchid }, true)
        .then(res => {
          if (username === this.user.username || username === 'me') {
            this.user.followed_branches.push(branchid);
          }
          return resolve(res);
        })
        .catch(err => reject(err.data || err));
    });
  }

  getNotifications(username, unreadCount, lastNotificationId) {
    return new Promise((resolve, reject) => {
      this.API.get('/user/:username/notifications', { username }, { unreadCount, lastNotificationId })
        .then(res => resolve(res.data))
        .catch(err => reject(err.data || err));
    });
  }

  isAuthenticated() {
    return !!this.user && Object.keys(this.user).length;
  }

  login(credentials) {
    return new Promise((resolve, reject) => {
      Generator.run(function* () {
        try {
          yield this.API.request('POST', '/user/login', {}, credentials, true);
          const user = yield this.fetch('me');

          this.set(user);

          return resolve();
        }
        catch (err) {
          return reject(err.data || err);
        }
      }, this);
    });
  }

  logout() {
    return new Promise((resolve, reject) => {
      this.API.request('GET', '/user/logout', {})
        .then(() => {
          this.LocalStorageService.setObject('cache', {});

          this.set({});

          return resolve();
        })
        .catch(err => reject(err));
    });
  }

  markNotification(username, notificationid, unread) {
    return new Promise((resolve, reject) => {
      this.API.update('/user/:username/notifications/:notificationid', { username, notificationid }, { unread }, true)
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  // send a reset password link to the users inbox
  requestResetPassword(username) {
    return new Promise((resolve, reject) => {
      this.API.request('GET', '/user/:username/reset-password', { username })
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  // send a reset password link to the users inbox
  resetPassword(username, password, token) {
    return new Promise((resolve, reject) => {
      this.API.request('POST', '/user/:username/reset-password/:token', { username, token }, { password })
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  // resend the user verification email
  resendVerification(username) {
    return new Promise((resolve, reject) => {
      this.API.request('GET', '/user/:username/reverify', { username })
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  set(userDataObj) {
    this.$timeout(() => {
      this.user = userDataObj;
      this.EventService.emit(this.EventService.events.CHANGE_USER);
    });
  }

  signup(credentials) {
    credentials = credentials || {};

    if (!Validator.usernamePolicy(credentials.username)) {
      return Promise.reject({
        message: 'Username can contain only numbers, lowercase letters, underscore, and dash.',
      });
    }

    if (credentials.username.length < 1 || credentials.username.length > 20) {
      return Promise.reject({
        message: 'Username has to be between 1 and 20 characters long/',
      });
    }

    if (credentials.password !== credentials.confirmPassword) {
      return Promise.reject({
        message: 'The passwords do not match.',
      });
    }

    if (!Validator.passwordPolicy(credentials.password)) {
      return Promise.reject({
        message: 'Password has to be between 6 and 30 characters long.',
      });
    }

    if (credentials.name.length < 2 || credentials.name.length > 30) {
      return Promise.reject({
        message: 'Name has to be between 2 and 30 characters long.',
      });
    }

    return new Promise((resolve, reject) => {
      this.API.request('POST', '/user', {}, credentials)
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  unfollowBranch(username, branchid) {
    return new Promise((resolve, reject) => {
      this.API.delete('/user/:username/branches/followed', { username }, { branchid }, true)
        .then(res => {
          if (username === this.user.username || username === 'me') {
            const index = this.user.followed_branches.indexOf(branchid);
            if (index !== -1) {
              this.user.followed_branches.splice(index, 1);
            }
          }
          return resolve(res);
        })
        .catch(err => reject(err.data || err));
    });
  }

  update(data) {
    return new Promise((resolve, reject) => {
      Generator.run(function* () {
        try {
          yield this.API.update('/user/me', {}, data, true);

          const user = yield this.fetch('me');
          this.set(user);

          return resolve();
        }
        catch (err) {
          return reject(err.data || err);
        }
      }, this);
    });
  }

  // verify user account
  verify(username, token) {
    return new Promise((resolve, reject) => {
      this.API.request('GET', '/user/:username/verify/:token', { username, token })
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }
}

UserService.$inject = [
  '$timeout',
  'API',
  'ENV',
  'EventService',
  'LocalStorageService',
];

export default UserService;
