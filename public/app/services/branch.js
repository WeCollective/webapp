import Generator from 'utils/generator';
import Injectable from 'utils/injectable';
import Validator from 'utils/validator';

class BranchService extends Injectable {
  constructor(...injections) {
    super(BranchService.$inject, injections);

    this.branch = {
      id: this.$stateParams.branchid || 'root',
      name: this.$stateParams.branchid || 'All',
      parent: {
        id: 'none',
      },
    };

    let fetchingBranch = false;

    const updateBranch = () => {
      if (!this.$state.current.name.includes('weco.branch') ||
        (fetchingBranch && fetchingBranch === this.$state.params.branchid)) {
        return;
      }

      fetchingBranch = this.$state.params.branchid;

      let fetchedBranch = {};

      const tempImages = {
        coverUrl: this.branch.coverUrl,
        coverUrlThumb: this.branch.coverUrlThumb,
        profileUrl: this.branch.profileUrl,
        profileUrlThumb: this.branch.profileUrlThumb,
      };

      this.branch.coverUrl = tempImages.coverUrl;
      this.branch.coverUrlThumb = tempImages.coverUrlThumb;
      this.branch.profileUrl = tempImages.profileUrl;
      this.branch.profileUrlThumb = tempImages.profileUrlThumb;

      if (fetchingBranch && this.branch.id !== fetchingBranch) {
        // Preload the result.
        this.branch.id = fetchingBranch;

        if (fetchingBranch !== 'root') {
          this.branch.name = fetchingBranch;
        }
        else {
          this.branch.name = 'All';
          this.branch.parent = { id: 'none' };
        }
      }

      this.EventService.emit(this.EventService.events.CHANGE_BRANCH_PREFETCH, this.branch.id);

      this.fetch(fetchingBranch)
        .then(branch => {
          if (fetchingBranch === branch.id) {
            fetchedBranch = branch;
            this.branch = branch;
          }
        })
        .catch(err => {
          if (err.status === 404) {
            this.$state.go('weco.notfound');
          }
          else {
            this.AlertsService.push('error', 'Unable to fetch branch.');
          }
        })
        .then(() => {
          if (fetchingBranch === fetchedBranch.id) {
            // Wrap this into timeout to ensure any dependent controller has time to attach listener
            // before this event fires for the first time.
            this.$timeout(() => {
              this.EventService.emit(this.EventService.events.CHANGE_BRANCH, this.branch.id);
            }, 1);
            fetchingBranch = false;
          }
        });
    };

    updateBranch();

    this.EventService.on(this.EventService.events.STATE_CHANGE_SUCCESS, updateBranch);
  }

  actionSubbranchRequest(action, branchid, childid) {
    return new Promise((resolve, reject) => {
      this.API.put('/branch/:branchid/requests/subbranches/:childid', { branchid, childid }, { action }, true)
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  create(data) {
    data = data || {};

    if (!Validator.namePolicy(data.id)) {
      return Promise.reject({
        message: 'Unique name can contain only lowercase letters, underscore, and dash.',
      });
    }

    if (data.name.length > 30) {
      return Promise.reject({
        message: 'Visible name cannot be longer than 30 characters.',
      });
    }

    return new Promise((resolve, reject) => {
      this.API.post('/branch', {}, data)
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  fetch(branchid) {
    return new Promise((resolve, reject) => {
      Generator.run(function* () { // eslint-disable-line func-names
        try {
          let res = yield this.API.get('/branch/:branchid', { branchid });
          const branch = res.data;

          // console.log(branch);

          // attach parent branch
          if (branch.parentid === 'root' || branch.parentid === 'none') {
            branch.parent = {
              id: branch.parentid,
            };
          }
          else {
            res = yield this.API.get('/branch/:branchid', { branchid: branch.parentid });
            // console.log(res.data);
            branch.parent = res.data;
          }

          delete branch.parentid;

          // attach moderator list
          branch.mods = yield this.ModService.fetchByBranch(branch.id);

          return resolve(branch);
        }
        catch (err) {
          return reject(err.data || err);
        }
      }, this);
    });
  }

  getModLog(branchid) {
    return new Promise((resolve, reject) => {
      this.API.get('/branch/:branchid/modlog', { branchid })
        .then(res => resolve(res.data))
        .catch(err => reject(err.data || err));
    });
  }

  getPosts(branchid, timeafter, sortBy, stat, postType, lastPostId, flag) {
    return new Promise((resolve, reject) => {
      const params = {
        flag: !!flag,
        postType,
        sortBy,
        stat,
        timeafter,
      };

      if (lastPostId) {
        params.lastPostId = lastPostId;
      }

      this.API.get('/branch/:branchid/posts', { branchid }, params)
        .then(res => resolve(res.data))
        .catch(err => reject(err.data || err));
    });
  }

  getSubbranches(branchid, timeafter, sortBy, lastBranchId) {
    return new Promise((resolve, reject) => {
      const params = {
        sortBy,
        timeafter,
      };

      if (lastBranchId) {
        params.lastBranchId = lastBranchId;
      }

      this.API.get('/branch/:branchid/subbranches', { branchid }, params)
        .then(res => resolve(res.data), true)
        .catch(err => reject(err.data || err));
    });
  }

  getSubbranchRequests(branchid) {
    return new Promise((resolve, reject) => {
      this.API.get('/branch/:branchid/requests/subbranches', { branchid })
        .then(res => resolve(res.data))
        .catch(err => reject(err.data || err));
    });
  }

  isFollowingBranch() {
    return this.UserService.isAuthenticated() &&
      this.UserService.user.followed_branches.includes(this.branch.id);
  }

  isModerator() {
    const { mods } = this.branch;

    if (!mods || !Array.isArray(mods)) {
      return false;
    }

    for (let i = 0; i < mods.length; i += 1) {
      if (mods[i].username === this.UserService.user.username) {
        return true;
      }
    }

    return false;
  }

  remove(branchid, child) {
    const params = child ? { child } : {};
    return new Promise((resolve, reject) => {
      this.API.delete('/branch/:branchid', { branchid }, params, true)
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  resolveFlaggedPost(branchid, postid, action, data, message) {
    return new Promise((resolve, reject) => {
      const body = {
        action,
        message,
      };

      body[action === 'change_type' ? 'type' : 'reason'] = data;

      this.API.post('/branch/:branchid/posts/:postid/resolve', { branchid, postid }, body)
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  submitSubbranchRequest(branchid, childid) {
    return new Promise((resolve, reject) => {
      this.API.post('/branch/:branchid/requests/subbranches/:childid', { branchid, childid })
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  update(branchid, data) {
    return new Promise((resolve, reject) => {
      this.API.put('/branch/:branchid', { branchid }, data, true)
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }
}

BranchService.$inject = [
  '$state',
  '$stateParams',
  '$timeout',
  'AlertsService',
  'API',
  'EventService',
  'ModService',
  'UserService',
];

export default BranchService;
