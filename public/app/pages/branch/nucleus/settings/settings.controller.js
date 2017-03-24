import Injectable from 'utils/injectable';

class BranchNucleusSettingsController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusSettingsController.$inject, injections);
  }

  openVisibleNameModal() {
    this.ModalService.open(
      'BRANCH_NUCLEUS_SETTINGS',
      {
        title: 'Visible Name',
        inputs: [
          {
            placeholder: 'Visible name',
            type: 'text',
            fieldname: 'name'
          }
        ],
        textareas: []
      },
      'Successfully updated branch settings!',
      'Unable to update branch settings.'
    );
  }

  openRulesModal() {
    this.ModalService.open(
      'BRANCH_NUCLEUS_SETTINGS',
      {
        title: 'Rules & Etiquette',
        inputs: [],
        textareas: [
          {
            placeholder: 'Rules & Etiquette Text',
            fieldname: 'rules',
            value: this.BranchService.branch.rules
          }
        ]
      },
      'Successfully updated branch settings!',
      'Unable to update branch settings.'
    );
  }

  openDescriptionModal() {
    this.ModalService.open(
      'BRANCH_NUCLEUS_SETTINGS',
      {
        title: 'Description',
        inputs: [],
        textareas: [
          {
            placeholder: 'Description',
            fieldname: 'description',
            value: this.BranchService.branch.description
          }
        ]
      },
      'Successfully updated branch settings!',
      'Unable to update branch settings.'
    );
  }
}
BranchNucleusSettingsController.$inject = ['$timeout', '$state', 'BranchService', 'AlertsService', 'ModalService'];

export default BranchNucleusSettingsController;
