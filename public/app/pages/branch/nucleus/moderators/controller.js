import Injectable from 'utils/injectable';

class BranchNucleusModeratorsController extends Injectable {
  constructor (...injections) {
    super(BranchNucleusModeratorsController.$inject, injections);

    this.mods = this.LocalStorageService.getObject('cache').branchNucleusMods || [];
    this.isLoading = false;

    this.getAllMods = this.getAllMods.bind(this);
    this.getMod = this.getMod.bind(this);

    let listeners = [];

    listeners.push(this.EventService.on(this.EventService.events.CHANGE_BRANCH, this.getAllMods));

    this.$scope.$on('$destroy', _ => listeners.forEach(deregisterListener => deregisterListener()));
  }

  getAllMods () {
    if (!Object.keys(this.BranchService.branch).length || this.isLoading === true) return;

    this.isLoading = true;

    let promises = [];
    
    for (let i = 0; i < this.BranchService.branch.mods.length; i++) {
      promises.push(this.getMod(this.BranchService.branch.mods[i].username, i));
    }

    // when all mods fetched, loading finished
    Promise.all(promises)
      .then(_ => {
        let cache = this.LocalStorageService.getObject('cache');
        cache.branchNucleusMods = this.mods;
        this.LocalStorageService.setObject('cache', cache);

        this.$timeout(_ => this.isLoading = false);
      })
      .catch(_ => {
        this.AlertsService.push('error', 'Error fetching moderators.');
        this.$timeout(_ => this.isLoading = false);
      });
  }

  getMod (username, index) {
    return this.UserService.fetch(username)
      .then(user => this.mods[index] = user)
      .catch(_ => this.AlertsService.push('error', 'Error fetching moderator.'));
  }
}

BranchNucleusModeratorsController.$inject = [
  '$scope',
  '$timeout',
  'AlertsService',
  'BranchService',
  'EventService',
  'LocalStorageService',
  'UserService'
];

export default BranchNucleusModeratorsController;
