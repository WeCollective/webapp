import Injectable from 'utils/injectable.js';

class ProfileSettingsModalController extends Injectable {
  constructor (...injections) {
    super(ProfileSettingsModalController.$inject, injections);

    this.values = [];
    this.errorMessage = '';
    this.isLoading = false;

    this.EventService.on(this.EventService.events.MODAL_OK, name => {
      if (name !== 'PROFILE_SETTINGS') return;
      
      // if not all fields are filled, display message
      if (this.values.length < this.ModalService.inputArgs.inputs.length ||
         this.values.indexOf('') !== -1) {
        return this.$timeout( () => { this.errorMessage = 'Please fill in all fields'; } );
      }

      // construct data to update using the proper fieldnames
      let updateData = {};
      for (let i = 0; i < this.ModalService.inputArgs.inputs.length; i++) {
        updateData[this.ModalService.inputArgs.inputs[i].fieldname] = this.values[i];

        // convert date input values to unix timestamp
        if (this.ModalService.inputArgs.inputs[i].type === 'date') {
          updateData[this.ModalService.inputArgs.inputs[i].fieldname] = new Date(this.values[i]).getTime();
        }
      }

      // perform the update
      this.isLoading = true;
      
      this.UserService.update(updateData)
        .then( () => {
          this.values = [];
          this.errorMessage = '';
          this.isLoading = false;
          this.ModalService.OK();
        })
        .catch( err => {
          this.errorMessage = err.message;
          this.isLoading = false;
        })
        .then(this.$timeout);
    });

    this.EventService.on(this.EventService.events.MODAL_CANCEL, name => {
      if (name !== 'PROFILE_SETTINGS') return;
      
      this.$timeout( () => {
        this.values = [];
        this.errorMessage = '';
        this.isLoading = false;
        this.ModalService.Cancel();
      });
    });
  }
}

ProfileSettingsModalController.$inject = [
  '$timeout',
  'EventService',
  'ModalService',
  'UserService'
];

export default ProfileSettingsModalController;