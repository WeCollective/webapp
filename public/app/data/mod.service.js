import Injectable from 'utils/injectable';
import Generator from 'utils/generator';

class ModService extends Injectable {
  constructor(...injections) {
    super(ModService.$inject, injections);
  }

  fetchByBranch(branchid) {
    return new Promise((resolve, reject) => {
      this.API.fetch('/branch/:branchid/mods', {
        branchid: branchid
      })
      .then((response) => { return resolve(response.data); })
      .catch((response) => { return reject(response.data || response); });
    });
  }

  create(branchid, username) {
    return new Promise((resolve, reject) => {
      this.API.save('/branch/:branchid/mods', {
        branchid: branchid
      }, {
        username: username
      })
      .then(resolve)
      .catch((response) => { return reject(response.data || response); });
    });
  }
}
ModService.$inject = ['API', '$state', 'EventService', 'AlertsService'];

export default ModService;
