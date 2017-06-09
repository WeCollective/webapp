import Injectable from 'utils/injectable';
import Generator from 'utils/generator';

class UserService extends Injectable {
  constructor (...injections) {
    super(UserService.$inject, injections);
    this.user = {};

    this.fetch('me')
      .then(user => this.user = user)
      .catch(_ => {})
      .then(this.$timeout)
      .then(_ => this.EventService.emit(this.EventService.events.CHANGE_USER));
  }

  fetch (username) {
    return new Promise((resolve, reject) => {
      this.API.fetch('/user/:username', { username })
        .then(res => resolve(res.data))
        .catch(err => reject(err.data || err));
    });
  }

  followBranch (username, branchid) {
    return new Promise((resolve, reject) => {
      this.API.save('/user/:username/branches/followed', { username }, { branchid }, true)
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  getNotifications (username, unreadCount, lastNotificationId) {
    return new Promise((resolve, reject) => {
      this.API.fetch('/user/:username/notifications', { username }, { unreadCount, lastNotificationId })
        .then(res => resolve(res.data))
        .catch(err => reject(err.data || err));
    });
  }

  isAuthenticated () {
    return !!this.user && Object.keys(this.user).length;
  }

  login (credentials) {
    return new Promise((resolve, reject) => {
      Generator.run(function* () {
        try {
          yield this.API.request('POST', '/user/login', {}, credentials, true);
          let user = yield this.fetch('me');
          this.user = user;
          
          // Add delay for navbar to trigger constructor and attach listener for this event.
          this.$timeout(_ => this.EventService.emit(this.EventService.events.CHANGE_USER), 100);
          
          return resolve();
        }
        catch(err) { return reject(err.data || err); }
      }, this);
    });
  }

  logout () {
    return new Promise((resolve, reject) => {
      this.API.request('GET', '/user/logout', {})
        .then(_ => {
          this.LocalStorageService.setObject('cache', {});

          this.user = {};
          this.EventService.emit(this.EventService.events.CHANGE_USER);
          return resolve();
        })
        .catch(err => reject(err));
    });
  }

  markNotification (username, notificationid, unread) {
    return new Promise((resolve, reject) => {
      this.API.update('/user/:username/notifications/:notificationid', { username, notificationid }, { unread }, true)
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  // send a reset password link to the users inbox
  requestResetPassword (username) {
    return new Promise((resolve, reject) => {
      this.API.request('GET', '/user/:username/reset-password', { username })
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  // send a reset password link to the users inbox
  resetPassword (username, password, token) {
    return new Promise((resolve, reject) => {
      this.API.request('POST', '/user/:username/reset-password/:token', { username, token }, { password })
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  // resend the user verification email
  resendVerification (username) {
    return new Promise((resolve, reject) => {
      this.API.request('GET', '/user/:username/reverify', { username })
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  signup (credentials) {
    return new Promise((resolve, reject) => {
      this.API.request('POST', '/user', {}, credentials)
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  unfollowBranch (username, branchid) {
    return new Promise((resolve, reject) => {
      this.API.delete('/user/:username/branches/followed', { username }, { branchid }, true)
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  update (data) {
    return new Promise((resolve, reject) => {
      Generator.run(function* () {
        try {
          // update self
          yield this.API.update('/user/me', {}, data, true);
          // fetch the updated self
          this.user = yield this.fetch('me');
          
          this.EventService.emit(this.EventService.events.CHANGE_USER);
          
          return resolve();
        }
        catch(err) { return reject(err.data || err); }
      }, this);
    });
  }

  // verify user account
  verify (username, token) {
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
  'LocalStorageService'
];

export default UserService;
