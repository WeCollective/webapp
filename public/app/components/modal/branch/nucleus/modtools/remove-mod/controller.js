import Injectable from 'utils/injectable.js';
import Generator from 'utils/generator.js';

class RemoveModModalController extends Injectable {
  constructor(...injections) {
    super(RemoveModModalController.$inject, injections);

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

    let init = () => {
      this.isLoading = true;
      Generator.run(function* () {
        try {
          for(let i = 0; i < this.ModalService.inputArgs.mods.length; i++) {
            yield getMod(this.ModalService.inputArgs.mods[i].username, i);
          }

          this.$timeout(() => { this.isLoading = false; });
        } catch(err) {
          this.$timeout(() => {
            this.AlertsService.push('error', 'Unable to fetch moderators!');
            this.ModalService.Cancel();
          });
        }
      }, this);
    };

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

    init();
  }

  select(mod) {
    this.selectedMod = mod;
  }
}
RemoveModModalController.$inject = ['$timeout', '$state', 'EventService', 'UserService', 'ModalService', 'ModService'];

export default RemoveModModalController;
