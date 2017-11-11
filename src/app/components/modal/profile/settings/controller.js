import Injectable from 'utils/injectable';

class ProfileSettingsModalController extends Injectable {
  constructor(...injections) {
    super(ProfileSettingsModalController.$inject, injections);

    this.errorMessage = '';
    this.isLoading = false;
    this.values = [];

    const listeners = [];

    listeners.push(this.EventService.on(this.EventService.events.MODAL_OK, name => {
      if (name !== 'PROFILE_SETTINGS') return;

      // if not all fields are filled, display message
      if (this.values.length < this.ModalService.inputArgs.inputs.length || this.values.includes('')) {
        this.$timeout(() => this.errorMessage = 'Please fill in all fields');
        return;
      }

      // construct data to update using the proper fieldnames
      const updateData = {};

      for (let i = 0; i < this.ModalService.inputArgs.inputs.length; i += 1) {
        const input = this.ModalService.inputArgs.inputs[i];
        updateData[input.fieldname] = this.values[i];

        // convert date input values to unix timestamp
        if (input.type === 'date') {
          updateData[input.fieldname] = new Date(this.values[i]).getTime();
        }
      }

      // perform the update
      this.isLoading = true;

      this.UserService.update(updateData)
        .then(() => {
          this.errorMessage = '';
          this.isLoading = false;
          this.values = [];
          this.ModalService.OK();
        })
        .catch(err => {
          this.errorMessage = err.message;
          this.isLoading = false;
        });
    }));

    listeners.push(this.EventService.on(this.EventService.events.MODAL_CANCEL, name => {
      if (name !== 'PROFILE_SETTINGS') return;

      this.$timeout(() => {
        this.errorMessage = '';
        this.isLoading = false;
        this.values = [];
        this.ModalService.Cancel();
      });
    }));

    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }
}

ProfileSettingsModalController.$inject = [
  '$scope',
  '$timeout',
  'EventService',
  'ModalService',
  'UserService',
];

export default ProfileSettingsModalController;
