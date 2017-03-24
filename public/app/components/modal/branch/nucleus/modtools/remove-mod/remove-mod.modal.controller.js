import Injectable from 'utils/injectable.js';

class BranchNucleusModtoolsRemoveModController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusModtoolsRemoveModController.$inject, injections);

    this.errorMessage = '';
    this.isLoading = false;
    this.mods = {};
    this.selectedMod = {};

    let getMod = (username, index) => {
      return this.UserService.fetch(username).then((data) => {
        this.$timeout(() => { this.mods[index] = data; });
      }).catch(() => {
        this.$timeout(() => { this.errorMessage = 'Unable to get mod!'; });
      });
    };

    // populate mods array with full mod user data based on the usernames
    // given as an argument to the modal
    let promises = [];
    for(let i = 0; i < this.ModalService.inputArgs.mods.length; i++) {
      promises.push(getMod(this.ModalService.inputArgs.mods[i].username, i));
    }
    // when all mods fetched, loading finished
    Promise.all(promises).then(() => { this.isLoading = false; });

    this.EventService.on(this.EventService.events.MODAL_OK, (name) => {
      if(name !== 'REMOVE_MOD') return;
      this.isLoading = true;
      this.ModService.remove(this.ModalService.inputArgs.branchid, this.selectedMod.username)
        .then(() => {
          this.$timeout(() => {
            this.ModalService.OK({
              removedMod: this.selectedMod.username
            });
            this.selectedMod = {};
            this.errorMessage = '';
            this.isLoading = false;
          });
        }).catch((response) => {
          this.$timeout(() => {
            this.errorMessage = response.message;
            if(response.status === 404) {
              this.errorMessage = 'That user doesn\'t exist';
            }
            this.isLoading = false;
          });
        });
    });

    this.EventService.on(this.EventService.events.MODAL_CANCEL, (name) => {
      if(name !== 'REMOVE_MOD') return;
      this.$timeout(() => {
        this.ModalService.Cancel();
        this.selectedMod = {};
        this.errorMessage = '';
        this.isLoading = false;
      });
    });
  }

  select(mod) {
    this.selectedMod = mod;
  }
}
BranchNucleusModtoolsRemoveModController.$inject = ['$timeout', '$state', 'EventService', 'UserService', 'ModalService', 'ModService'];

export default BranchNucleusModtoolsRemoveModController;
