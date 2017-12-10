import Injectable from 'utils/injectable';

class ProfileSettingsController extends Injectable {
  constructor(...injections) {
    super(ProfileSettingsController.$inject, injections);
  }

  openDOBModal() {
    const { dob } = this.UserService.user;
    this.ModalService.open(
      'PROFILE_SETTINGS',
      {
        title: 'Date of Birth',
        inputs: [{
          placeholder: 'Date of Birth',
          type: 'date',
          fieldname: 'dob',
          value: new Date(dob),
        }],
      },
      'Successfully updated profile settings!',
      'Unable to update profile settings.',
    );
  }

  openEmailModal() {
    const { email } = this.UserService.user;
    this.ModalService.open(
      'PROFILE_SETTINGS',
      {
        title: 'Email',
        inputs: [{
          placeholder: 'Email',
          type: 'email',
          fieldname: 'email',
          value: email,
        }],
      },
      'Successfully updated profile settings!',
      'Unable to update profile settings.',
    );
  }

  openNameModal() {
    const { name } = this.UserService.user;
    this.ModalService.open(
      'PROFILE_SETTINGS',
      {
        title: 'Name',
        inputs: [{
          fieldname: 'name',
          placeholder: 'Name',
          type: 'text',
          value: name,
        }],
      },
      'Successfully updated profile settings!',
      'Unable to update profile settings.',
    );
  }

  updateNSFW() {
    this.UserService.update({ show_nsfw: this.UserService.user.show_nsfw })
      .then(() => this.AlertsService.push('success', 'Successfully updated profile settings!'))
      .catch(() => this.AlertsService.push('error', 'Unable to update profile settings.'));
  }
}

ProfileSettingsController.$inject = [
  '$state',
  'AlertsService',
  'ModalService',
  'UserService',
];

export default ProfileSettingsController;
