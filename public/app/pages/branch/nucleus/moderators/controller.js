import Injectable from 'utils/injectable';

class BranchNucleusModeratorsController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusModeratorsController.$inject, injections);

    this.mods = [];
    this.isLoading = true;

    const getMod = (username, index) => {
      return this.UserService.fetch(username)
        .then( user => this.$timeout( _ => this.mods[index] = user ) )
        .catch( _ => this.AlertsService.push('error', 'Error fetching moderator.') );
    };

    const getAllMods = () => {
      if (!Object.keys(this.BranchService.branch).length) return;

      let promises = [];

      this.$timeout( _ => this.isLoading = true );
      
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

    getAllMods();

    this.EventService.on(this.EventService.events.CHANGE_BRANCH, getAllMods);
  }
}

BranchNucleusModeratorsController.$inject = [
  '$timeout',
  'AlertsService',
  'BranchService',
  'EventService',
  'UserService'
];

export default BranchNucleusModeratorsController;