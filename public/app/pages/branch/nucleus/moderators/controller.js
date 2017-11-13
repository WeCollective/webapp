import Injectable from 'utils/injectable';

class BranchNucleusModeratorsController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusModeratorsController.$inject, injections);

    console.log('juch');

    const cache = this.LocalStorageService.getObject('cache').branchNucleusMods || {};

    this.mods = cache[this.BranchService.branch.id] || [];
    this.isLoading = false;

    this.getAllMods = this.getAllMods.bind(this);
    this.getMod = this.getMod.bind(this);

    const { events } = this.EventService;
    const listeners = [];
    listeners.push(this.EventService.on(events.CHANGE_BRANCH, this.getAllMods));
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  getAllMods() {
    if (Object.keys(this.BranchService.branch).length < 2 || this.isLoading === true) return;

    this.isLoading = true;

    const promises = [];

    for (let i = 0; i < this.BranchService.branch.mods.length; i += 1) {
      promises.push(this.getMod(this.BranchService.branch.mods[i].username));
    }

    // when all mods fetched, loading finished
    Promise.all(promises)
      .then(values => {
        this.mods = values;

        const cache = this.LocalStorageService.getObject('cache');
        cache.branchNucleusMods = cache.branchNucleusMods || {};
        cache.branchNucleusMods[this.BranchService.branch.id] = this.mods;
        this.LocalStorageService.setObject('cache', cache);

        this.$timeout(() => this.isLoading = false);
      })
      .catch(() => {
        this.AlertsService.push('error', 'Error fetching moderators.');
        this.$timeout(() => this.isLoading = false);
      });
  }

  getMod(username) {
    return new Promise(resolve => this.UserService.fetch(username)
      .then(user => resolve(user))
      .catch(() => {
        this.AlertsService.push('error', 'Error fetching moderator.');
        return resolve();
      }));
  }
}

BranchNucleusModeratorsController.$inject = [
  '$scope',
  '$timeout',
  'AlertsService',
  'BranchService',
  'EventService',
  'LocalStorageService',
  'UserService',
];

export default BranchNucleusModeratorsController;
