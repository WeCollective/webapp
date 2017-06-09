import Injectable from 'utils/injectable';
//import Generator from 'utils/generator';

class ModService extends Injectable {
  constructor (...injections) {
    super(ModService.$inject, injections);
  }

  create (branchid, username) {
    return new Promise((resolve, reject) => {
      this.API.save('/branch/:branchid/mods', { branchid }, { username })
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  fetchByBranch (branchid) {
    return new Promise((resolve, reject) => {
      this.API.fetch('/branch/:branchid/mods', { branchid })
        .then(res => resolve(res.data))
        .catch(err => reject(err.data || err));
    });
  }

  remove (branchid, username) {
    return new Promise((resolve, reject) => {
      this.API.remove('/branch/:branchid/mods/:username', { branchid, username })
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }
}

ModService.$inject = [
  'API'
];

export default ModService;