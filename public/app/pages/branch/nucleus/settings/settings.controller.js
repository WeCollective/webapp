import Injectable from 'utils/injectable';

class BranchNucleusSettingsController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusSettingsController.$inject, injections);
  }

  openModal(args) {
    this.ModalService.open('/app/components/modal/branch/nucleus/settings/settings.modal.view.html', args)
      .then((result) => {
        // reload state to force profile reload if OK was pressed
        if(result) {
          this.$state.go(this.$state.current, {}, { reload: true });
          this.AlertsService.push('success', 'Successfully updated branch settings!');
        }
      }).catch((err) => {
        this.AlertsService.push('error', 'Unable to update branch settings.');
      });
  }

  openVisibleNameModal() {
    this.openModal({
      title: 'Visible Name',
      inputs: [
        {
          placeholder: 'Visible name',
          type: 'text',
          fieldname: 'name'
        }
      ],
      textareas: []
    });
  }

  openRulesModal() {
    this.openModal({
      title: 'Rules & Etiquette',
      inputs: [],
      textareas: [
        {
          placeholder: 'Rules & Etiquette Text',
          fieldname: 'rules',
          value: this.BranchService.branch.rules
        }
      ]
    });
  }

  openDescriptionModal() {
    this.openModal({
      title: 'Description',
      inputs: [],
      textareas: [
        {
          placeholder: 'Description',
          fieldname: 'description',
          value: this.BranchService.branch.description
        }
      ]
    });
  }
}
BranchNucleusSettingsController.$inject = ['$timeout', '$state', 'BranchService', 'AlertsService', 'ModalService'];

export default BranchNucleusSettingsController;
