import Injectable from 'utils/injectable';

class ProfileSettingsController extends Injectable {
  constructor(...injections) {
    super(ProfileSettingsController.$inject, injections);
  }

  openModal(args) {
    this.ModalService.open('/app/components/modals/profile/settings/settings.modal.view.html', args)
      .then((result) => {
        // reload state to force profile reload if OK was pressed
        if(result) {
          this.$state.go(this.$state.current, {}, { reload: true });
          this.AlertsService.push('success', 'Successfully updated profile settings!');
        }
      }).catch((err) => {
        this.AlertsService.push('error', 'Unable to update profile settings.');
      });
  }

  openNameModal() {
    this.openModal({
      title: 'Name',
      inputs: [{
          placeholder: 'First name',
          type: 'text',
          fieldname: 'firstname'
        }, {
          placeholder: 'Last name',
          type: 'text',
          fieldname: 'lastname'
        }
      ]
    });
  }

  openEmailModal() {
    this.openModal({
      title: 'Email',
      inputs: [{
        placeholder: 'Email',
        type: 'email',
        fieldname: 'email'
      }]
    });
  }

  openDOBModal() {
    this.openModal({
      title: 'Date of Birth',
      inputs: [{
        placeholder: 'Date of Birth',
        type: 'date',
        fieldname: 'dob'
      }]
    });
  }

  updateNSFW() {
    this.UserService.update({
      show_nsfw: this.UserService.user.show_nsfw
    }).then(() => {
      this.AlertsService.push('success', 'Successfully updated profile settings!');
    }).catch(() => {
      this.AlertsService.push('error', 'Unable to update profile settings.');
    });
  }
}
ProfileSettingsController.$inject = ['$state', 'ModalService', 'AlertsService', 'UserService'];

export default ProfileSettingsController;
