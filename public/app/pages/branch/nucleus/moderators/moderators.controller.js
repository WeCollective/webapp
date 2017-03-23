import Injectable from 'utils/injectable';

class BranchNucleusModeratorsController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusModeratorsController.$inject, injections);

    this.mods = [];
    this.isLoading = true;

    let getMod = (username, index) => {
      return this.UserService.fetch(username).then((user) => {
        this.$timeout(() => { this.mods[index] = user; });
      }).catch(() => {
        this.AlertsService.push('error', 'Error fetching moderator.');
      });
    };

    let getAllMods = () => {
      if(Object.keys(this.BranchService.branch).length === 0) return;

      let promises = [];
      this.$timeout(() => { this.isLoading = true; });
      for(let i = 0; i < this.BranchService.branch.mods.length; i++) {
        promises.push(getMod(this.BranchService.branch.mods[i].username, i));
      }
      // when all mods fetched, loading finished
      Promise.all(promises).then(() => {
        this.$timeout(() => { this.isLoading = false; });
      }).catch(() => {
        this.AlertsService.push('error', 'Error fetching moderators.');
        this.$timeout(() => { this.isLoading = false; });
      });
    };

    getAllMods();
    this.EventService.on(this.EventService.events.CHANGE_BRANCH, getAllMods);
  }
}
BranchNucleusModeratorsController.$inject = ['$timeout', 'UserService', 'BranchService', 'AlertsService', 'EventService'];

export default BranchNucleusModeratorsController;
