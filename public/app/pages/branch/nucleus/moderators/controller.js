import Injectable from 'utils/injectable';

class BranchNucleusModeratorsController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusModeratorsController.$inject, injections);

    const cache = this.LocalStorageService.getObject('cache').branchNucleusMods || {};

    this.mods = cache[this.BranchService.branch.id] || [];
    this.isLoading = false;

    this.getAllMods = this.getAllMods.bind(this);
    this.getMod = this.getMod.bind(this);

    const { events } = this.EventService;
    const listeners = [
      this.EventService.on(events.CHANGE_BRANCH, this.getAllMods),
    ];
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  getAllMods() {
    if (Object.keys(this.BranchService.branch).length < 2 || this.isLoading === true) return;

    this.isLoading = true;

    let promises = [];

    const {
      id,
      mods,
    } = this.BranchService.branch;

    for (let i = 0; i < mods.length; i += 1) {
      promises = [
        ...promises,
        this.getMod(mods[i].username),
      ];
    }

    // when all mods fetched, loading finished
    Promise.all(promises)
      .then(values => {
        this.mods = values;

        const cache = this.LocalStorageService.getObject('cache');
        cache.branchNucleusMods = cache.branchNucleusMods || {};
        cache.branchNucleusMods[id] = this.mods;
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
