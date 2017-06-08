import Injectable from 'utils/injectable';

class BranchNucleusModeratorsController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusModeratorsController.$inject, injections);

    this.mods = [];
    this.isLoading = false;

    const getMod = (username, index) => {
      return this.UserService.fetch(username)
        .then( user => this.mods[index] = user )
        .catch( _ => this.AlertsService.push('error', 'Error fetching moderator.') );
    };

    const getAllMods = _ => {
      if (!Object.keys(this.BranchService.branch).length || this.isLoading === true) return;

      this.isLoading = true;

      let promises = [];
      
      for (let i = 0; i < this.BranchService.branch.mods.length; i++) {
        promises.push(getMod(this.BranchService.branch.mods[i].username, i));
      }

      // when all mods fetched, loading finished
      Promise.all(promises)
        .then( _ => this.$timeout( _ => this.isLoading = false ) )
        .catch( _ => {
          this.AlertsService.push('error', 'Error fetching moderators.');
          this.$timeout( _ => this.isLoading = false );
        });
    };

    // todo cache this instead...
    //getAllMods();

    let listeners = [];

    listeners.push(this.EventService.on(this.EventService.events.CHANGE_BRANCH, getAllMods));

    this.$scope.$on('$destroy', _ => listeners.forEach( deregisterListener => deregisterListener() ));
  }
}

BranchNucleusModeratorsController.$inject = [
  '$scope',
  '$timeout',
  'AlertsService',
  'BranchService',
  'EventService',
  'UserService'
];

export default BranchNucleusModeratorsController;