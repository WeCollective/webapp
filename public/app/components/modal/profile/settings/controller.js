import Injectable from 'utils/injectable';

class ProfileSettingsModalController extends Injectable {
  constructor(...injections) {
    super(ProfileSettingsModalController.$inject, injections);

    const { inputs } = this.ModalService.inputArgs;

    this.errorMessage = '';
    this.isLoading = false;
    this.values = inputs.map(x => x.value).filter(x => x !== undefined);

    const { events } = this.EventService;
    const listeners = [
      this.EventService.on(events.MODAL_CANCEL, this.handleCancel.bind(this)),
      this.EventService.on(events.MODAL_OK, this.handleOK.bind(this)),
    ];
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  handleCancel(name) {
    if (name !== 'PROFILE_SETTINGS') return;

    this.$timeout(() => {
      this.errorMessage = '';
      this.isLoading = false;
      this.values = [];
      this.ModalService.Cancel();
    });
  }

  handleOK(name) {
    if (name !== 'PROFILE_SETTINGS') return;

    const { inputs } = this.ModalService.inputArgs;
    // Construct data to update using the proper field names.
    const updateData = {};

    for (let i = 0; i < inputs.length; i += 1) {
      const input = inputs[i];
      const value = this.values[i];

      if (input.required && (value === undefined || value === '')) {
        this.$timeout(() => this.errorMessage = 'Please fill in all fields');
        return;
      }

      updateData[input.fieldname] = value;

      // convert date input values to unix timestamp
      if (input.type === 'date') {
        updateData[input.fieldname] = new Date(value).getTime();
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
