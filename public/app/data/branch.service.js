import Injectable from 'utils/injectable';
import Generator from 'utils/generator';

class BranchService extends Injectable {
  constructor(...injections) {
    super(BranchService.$inject, injections);
    this.branch = {};

    let updateBranch = () => {
      if(this.$state.current.name.indexOf('weco.branch') > -1) {
        this.fetch(this.$state.params.branchid).then((branch) => {
          this.branch = branch;
        })
        .catch((response) => {
          if(response.status === 404) {
            this.$state.go('weco.notfound');
          } else {
            this.AlertsService.push('error', 'Unable to fetch branch.');
          }
        })
        .then(() => {
          this.EventService.emit(this.EventService.events.CHANGE_BRANCH);
        })
        .then(this.$timeout);
      }
    };

    updateBranch();
    this.EventService.on(this.EventService.events.STATE_CHANGE_SUCCESS, updateBranch);
  }

  fetch(branchid) {
    return new Promise((resolve, reject) => {
      Generator.run(function* (self) {
        try {
          let response = yield self.API.fetch('/branch/:branchid', { branchid: branchid });
          let branch = response.data;

          try {
            // attach urls for the branch's profile and cover pictures (inc. thumbnails)
            response = yield self.API.fetch('/branch/:branchid/:picture', { branchid: branchid, picture: 'picture' });
            branch.profileUrl = response.data;
            response = yield self.API.fetch('/branch/:branchid/:picture', { branchid: branchid, picture: 'picture-thumb' });
            branch.profileUrlThumb = response.data;
            response = yield self.API.fetch('/branch/:branchid/:picture', { branchid: branchid, picture: 'cover' });
            branch.coverUrl = response.data;
            response = yield self.API.fetch('/branch/:branchid/:picture', { branchid: branchid, picture: 'cover-thumb' });
            branch.coverUrlThumb = response.data;
          } catch(err) { /* It's okay if we don't have any photos */ }

          // attach parent branch
          if(branch.parentid === 'root' || branch.parentid === 'none') {
            branch.parent = {
              id: branch.parentid
            };
          } else {
            response = yield self.API.fetch('/branch/:branchid', { branchid: branch.parentid });
            branch.parent = response.data;
          }
          delete branch.parentid;

          // attach moderator list
          branch.mods = yield self.ModService.fetchByBranch(branch.id);

          return resolve(branch);
        } catch(response) { return reject(response.data || response); }
      }, this);
    });
  }

  update(branchid, data) {
    return new Promise((resolve, reject) => {
      this.API.update('/branch/:branchid', { branchid: branchid }, data)
        .then(resolve)
        .catch((response) => { return reject(response.data || response); });
    });
  }

  remove(branchid) {
    return new Promise((resolve, reject) => {
      this.API.remove('/branch/:branchid', { branchid: branchid })
        .then(resolve)
        .catch((response) => { return reject(response.data || response); });
    });
  }
}
BranchService.$inject = ['API', '$state', 'EventService', 'AlertsService', 'ModService'];

export default BranchService;
