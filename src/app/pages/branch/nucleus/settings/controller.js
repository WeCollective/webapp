import Injectable from 'utils/injectable';

class BranchNucleusSettingsController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusSettingsController.$inject, injections);
  }

  openModal(modalType) {
    let inputs = [];
    const route = `branch/${this.BranchService.branch.id}/`;
    let templateName = 'BRANCH_NUCLEUS_SETTINGS';
    let textareas = [];
    let title = '';
    let type;

    if (modalType === 'profile-picture') {
      type = 'picture';
    }
    else if (modalType === 'cover-picture') {
      type = 'cover';
    }

    switch (modalType) {
      case 'profile-picture':
      case 'cover-picture':
        templateName = 'UPLOAD_IMAGE';
        break;

      case 'description':
        title = 'Description';
        textareas = [{
          fieldname: 'description',
          placeholder: 'Description',
          value: this.BranchService.branch.description,
        }];
        break;

      case 'rules':
        title = 'Rules & Etiquette';
        textareas = [{
          fieldname: 'rules',
          placeholder: 'Rules & Etiquette Text',
          value: this.BranchService.branch.rules,
        }];
        break;

      case 'visible-name':
        title = 'Visible Name';
        inputs = [{
          fieldname: 'name',
          placeholder: 'Visible name',
          type: 'text',
        }];
        break;

      default:
        break;
    }

    this.ModalService.open(
      templateName,
      templateName === 'UPLOAD_IMAGE' ? { route, type } : { inputs, textareas, title },
      'Successfully updated branch settings!',
      'Unable to update branch settings.',
    );
  }
}

BranchNucleusSettingsController.$inject = [
  '$state',
  '$timeout',
  'AlertsService',
  'BranchService',
  'EventService',
  'ModalService',
];

export default BranchNucleusSettingsController;
