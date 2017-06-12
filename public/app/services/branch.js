import Injectable from 'utils/injectable';
import Generator from 'utils/generator';

class BranchService extends Injectable {
  constructor (...injections) {
    super(BranchService.$inject, injections);
    
    this.branch = { id: 'root' };

    let fetchingBranch = false;

    const updateBranch = _ => {
      this.$timeout(_ => {
        if (this.$state.current.name.includes('weco.branch') && (!fetchingBranch || fetchingBranch !== this.$state.params.branchid)) {
          fetchingBranch = this.$state.params.branchid;

          let fetchedBranch = {};

          const tempImages = {
            coverUrl: this.branch.coverUrl,
            coverUrlThumb: this.branch.coverUrlThumb,
          };

          if (fetchingBranch && this.branch.id !== fetchingBranch) {
            this.branch = tempImages.coverUrl ? tempImages : {};
            this.branch.id = fetchingBranch;
          }

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
            .then(_ => {
              if (fetchingBranch === fetchedBranch.id) {
                // Wrap this into timeout to ensure any dependent controller has time to attach listener
                // before this event fires for the first time.
                this.$timeout(_ => this.EventService.emit(this.EventService.events.CHANGE_BRANCH, this.branch.id), 1);
                fetchingBranch = false;
              }
            });
        }
      });
    };

    updateBranch();

    this.EventService.on(this.EventService.events.STATE_CHANGE_SUCCESS, updateBranch);
  }

  actionSubbranchRequest (action, branchid, childid) {
    return new Promise((resolve, reject) => {
      this.API.update('/branch/:branchid/requests/subbranches/:childid', { branchid, childid }, { action }, true)
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  create (data) {
    return new Promise((resolve, reject) => {
      this.API.save('/branch', {}, data)
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  fetch (branchid) {
    return new Promise((resolve, reject) => {
      Generator.run(function* () {
        try {
          let res = yield this.API.fetch('/branch/:branchid', { branchid });
          let branch = res.data;

          //console.log(branch);

          // attach parent branch
          if ('root' === branch.parentid || 'none' === branch.parentid) {
            branch.parent = {
              id: branch.parentid
            };
          }
          else {
            res = yield this.API.fetch('/branch/:branchid', { branchid: branch.parentid });
            //console.log(res.data);
            branch.parent = res.data;
          }

          delete branch.parentid;

          // attach moderator list
          branch.mods = yield this.ModService.fetchByBranch(branch.id);

          return resolve(branch);
        }
        catch (err) { return reject(err.data || err); }
      }, this);
    });
  }

  getModLog (branchid) {
    return new Promise((resolve, reject) => {
      this.API.fetch('/branch/:branchid/modlog', { branchid })
        .then(res => resolve(res.data))
        .catch(err => reject(err.data || err));
    });
  }

  getPosts (branchid, timeafter, sortBy, stat, postType, lastPostId, flag) {
    return new Promise((resolve, reject) => {
      let params = {
        flag: !!flag,
        postType,
        sortBy,
        stat,
        timeafter
      };

      if (lastPostId) {
        params.lastPostId = lastPostId;
      }

      this.API.fetch('/branch/:branchid/posts', { branchid }, params)
        .then(res => resolve(res.data))
        .catch(err => reject(err.data || err));
    });
  }

  getSubbranches (branchid, timeafter, sortBy, lastBranchId) {
    return new Promise((resolve, reject) => {
      let params = { sortBy, timeafter };

      if (lastBranchId) {
        params.lastBranchId = lastBranchId;
      }

      this.API.fetch('/branch/:branchid/subbranches', { branchid }, params)
        .then(res => resolve(res.data), true)
        .catch(err => reject(err.data || err));
    });
  }

  getSubbranchRequests (branchid) {
    return new Promise((resolve, reject) => {
      this.API.fetch('/branch/:branchid/requests/subbranches', { branchid })
        .then(res => resolve(res.data))
        .catch(err => reject(err.data || err));
    });
  }

  remove (branchid) {
    return new Promise((resolve, reject) => {
      this.API.remove('/branch/:branchid', { branchid })
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  resolveFlaggedPost (branchid, postid, action, data, message) {
    return new Promise((resolve, reject) => {
      let body = { action, message };
      
      body['change_type' === action ? 'type' : 'reason'] = data;
      
      this.API.save('/branch/:branchid/posts/:postid/resolve', { branchid, postid }, body)
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  submitSubbranchRequest (branchid, childid) {
    return new Promise((resolve, reject) => {
      this.API.save('/branch/:branchid/requests/subbranches/:childid', { branchid, childid })
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  update (branchid, data) {
    return new Promise((resolve, reject) => {
      this.API.update('/branch/:branchid', { branchid }, data, true)
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }
}

BranchService.$inject = [
  '$state',
  '$timeout',
  'AlertsService',
  'API',
  'EventService',
  'ModService'
];

export default BranchService;
