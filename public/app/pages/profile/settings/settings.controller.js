import Injectable from 'utils/injectable';

class ProfileSettingsController extends Injectable {
  constructor(...injections) {
    super(ProfileSettingsController.$inject, injections);
  }

  openNameModal() {
    this.ModalService.open(
      '/app/components/modal/profile/settings/settings.modal.view.html',
      {
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
      },
      'Successfully updated profile settings!',
      'Unable to update profile settings.'
    );
  }

  openEmailModal() {
    this.ModalService.open(
      '/app/components/modal/profile/settings/settings.modal.view.html',
      {
        title: 'Email',
        inputs: [{
          placeholder: 'Email',
          type: 'email',
          fieldname: 'email'
        }]
      },
      'Successfully updated profile settings!',
      'Unable to update profile settings.'
    );
  }

  openDOBModal() {
    this.ModalService.open(
      '/app/components/modal/profile/settings/settings.modal.view.html',
      {
        title: 'Date of Birth',
        inputs: [{
          placeholder: 'Date of Birth',
          type: 'date',
          fieldname: 'dob'
        }]
      },
      'Successfully updated profile settings!',
      'Unable to update profile settings.'
    );
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
