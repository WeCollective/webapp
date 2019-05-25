import Injectable from 'utils/injectable';
import Generator from 'utils/generator';

class RemoveModModalController extends Injectable {
  constructor(...injections) {
    super(RemoveModModalController.$inject, injections);

    this.errorMessage = '';
    this.isLoading = false;
    this.mods = [];
    this.selectedMod = {};

    const getMod = (username, index) => this.UserService.fetch(username)
      .then(data => this.$timeout(() => this.mods[index] = data))
      .catch(() => this.$timeout(() => this.errorMessage = 'Unable to get mod!'));

    const init = () => {
      this.isLoading = true;
      Generator.run(function* () { // eslint-disable-line func-names
        try {
          const { mods } = this.ModalService.inputArgs;

          for (let i = 0; i < mods.length; i += 1) {
            yield getMod(mods[i].username, i);
          }

          this.$timeout(() => this.isLoading = false);
        }
        catch (err) {
          this.$timeout(() => {
            this.AlertsService.push('error', 'Unable to fetch moderators!');
            this.ModalService.Cancel();
          });
        }
      }, this);
    };

    const { events } = this.EventService;
    const listeners = [];

    this.EventService.on(events.MODAL_OK, name => {
      if (name !== 'REMOVE_MOD') return;
      this.isLoading = true;
      this.ModalService.disabled = true;

      this.ModService.remove(this.ModalService.inputArgs.branchid, this.selectedMod.username)
        .then(() => this.$timeout(() => {
          this.ModalService.OK({
            removedMod: this.selectedMod.username,
          });
          this.selectedMod = {};
          this.errorMessage = '';
          this.isLoading = false;
          this.ModalService.disabled = false;
        }))
        .catch(response => this.$timeout(() => {
          this.errorMessage = response.message;
          if (response.status === 404) {
            this.errorMessage = 'That user doesn\'t exist';
          }
          this.isLoading = false;
          this.ModalService.disabled = false;
        }));
    });

    this.EventService.on(events.MODAL_CANCEL, name => {
      if (name !== 'REMOVE_MOD') return;
      this.$timeout(() => {
        this.ModalService.Cancel();
        this.selectedMod = {};
        this.errorMessage = '';
        this.isLoading = false;
      });
    });

    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));

    init();
  }

  select(mod) {
    this.selectedMod = mod;
  }
}

RemoveModModalController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'EventService',
  'ModalService',
  'ModService',
  'UserService',
];

export default RemoveModModalController;
