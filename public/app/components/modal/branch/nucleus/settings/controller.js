import Injectable from 'utils/injectable.js';

class BranchNucleusSettingsModalController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusSettingsModalController.$inject, injections);

    this.inputValues = [];
    this.textareaValues = [];
    this.errorMessage = '';
    this.isLoading = false;

    for(let i = 0; i < this.ModalService.inputArgs.textareas.length; i++) {
      this.textareaValues[i] = this.ModalService.inputArgs.textareas[i].value;
    }
    for(let i = 0; i < this.ModalService.inputArgs.inputs.length; i++) {
      this.inputValues[i] = this.ModalService.inputArgs.inputs[i].value;
    }

    this.EventService.on(this.EventService.events.MODAL_OK, (name) => {
      if(name !== 'BRANCH_NUCLEUS_SETTINGS') return;
      // if not all fields are filled, display message
      if(this.inputValues.length < this.ModalService.inputArgs.inputs.length || this.inputValues.indexOf('') > -1 ||
         this.textareaValues.length < this.ModalService.inputArgs.textareas.length || this.textareaValues.indexOf('') > -1) {
        this.$timeout(() => { this.errorMessage = 'Please fill in all fields'; });
        return;
      }

      // construct data to update using the proper fieldnames
      let updateData = {};
      for(let i = 0; i < this.ModalService.inputArgs.inputs.length; i++) {
        updateData[this.ModalService.inputArgs.inputs[i].fieldname] = this.inputValues[i];

        // convert date input values to unix timestamp
        if(this.ModalService.inputArgs.inputs[i].type === 'date') {
          updateData[this.ModalService.inputArgs.inputs[i].fieldname] = new Date(this.inputValues[i]).getTime();
        }
      }
      for(let i = 0; i < this.ModalService.inputArgs.textareas.length; i++) {
        updateData[this.ModalService.inputArgs.textareas[i].fieldname] = this.textareaValues[i];
      }

      // perform the update
      this.isLoading = true;
      this.BranchService.update(this.$state.params.branchid, updateData).then(() => {
        this.$timeout(() => {
          this.inputValues = [];
          this.textareaValues = [];
          this.errorMessage = '';
          this.isLoading = false;
          this.ModalService.OK();
        });
      }).catch((response) => {
        this.$timeout(() => {
          this.errorMessage = response.message;
          this.isLoading = false;
        });
      });
    });

    this.EventService.on(this.EventService.events.MODAL_CANCEL, (name) => {
      if(name !== 'BRANCH_NUCLEUS_SETTINGS') return;
      this.$timeout(() => {
        this.inputValues = [];
        this.textareaValues = [];
        this.errorMessage = '';
        this.isLoading = false;
        this.ModalService.Cancel();
      });
    });
  }
}
BranchNucleusSettingsModalController.$inject = ['$timeout', '$state', 'EventService', 'BranchService', 'ModalService'];

export default BranchNucleusSettingsModalController;
