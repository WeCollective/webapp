import Injectable from 'utils/injectable';

class BranchNucleusSettingsModalController extends Injectable {
  constructor (...injections) {
    super(BranchNucleusSettingsModalController.$inject, injections);

    this.errorMessage = '';
    this.inputValues = [];
    this.isLoading = false;
    this.textareaValues = [];

    for (let i = 0; i < this.ModalService.inputArgs.textareas.length; i++) {
      this.textareaValues[i] = this.ModalService.inputArgs.textareas[i].value;
    }
    
    for (let i = 0; i < this.ModalService.inputArgs.inputs.length; i++) {
      this.inputValues[i] = this.ModalService.inputArgs.inputs[i].value;
    }

    let listeners = [];

    listeners.push(this.EventService.on(this.EventService.events.MODAL_OK, name => {
      console.log('wow.');
      if (name !== 'BRANCH_NUCLEUS_SETTINGS') return;

      // if not all fields are filled, display message
      if (this.inputValues.length < this.ModalService.inputArgs.inputs.length || this.inputValues.includes('') ||
         this.textareaValues.length < this.ModalService.inputArgs.textareas.length || this.textareaValues.includes('')) {
        this.$timeout(_ => this.errorMessage = 'Please fill in all fields');
        return;
      }

      // construct data to update using the proper fieldnames
      let updateData = {};

      for (let i = 0; i < this.ModalService.inputArgs.inputs.length; i++) {
        updateData[this.ModalService.inputArgs.inputs[i].fieldname] = this.inputValues[i];

        // convert date input values to unix timestamp
        if (this.ModalService.inputArgs.inputs[i].type === 'date') {
          updateData[this.ModalService.inputArgs.inputs[i].fieldname] = new Date(this.inputValues[i]).getTime();
        }
      }

      for (let i = 0; i < this.ModalService.inputArgs.textareas.length; i++) {
        updateData[this.ModalService.inputArgs.textareas[i].fieldname] = this.textareaValues[i];
      }

      // perform the update
      this.isLoading = true;
      this.BranchService.update(this.$state.params.branchid, updateData)
        .then(_ => this.$timeout(_ => {
            this.errorMessage = '';
            this.inputValues = [];
            this.isLoading = false;
            this.textareaValues = [];
            this.ModalService.OK();
        }))
        .catch(err => this.$timeout(_ => {
          this.errorMessage = err.message;
          this.isLoading = false;
        }));
    }));

    listeners.push(this.EventService.on(this.EventService.events.MODAL_CANCEL, name => {
      if (name !== 'BRANCH_NUCLEUS_SETTINGS') return;
      
      this.$timeout(_ => {
        this.errorMessage = '';
        this.inputValues = [];
        this.isLoading = false;
        this.textareaValues = [];
        this.ModalService.Cancel();
      });
    }));

    this.$scope.$on('$destroy', _ => listeners.forEach(deregisterListener => deregisterListener()));
  }
}

BranchNucleusSettingsModalController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'BranchService',
  'EventService',
  'ModalService'
];

export default BranchNucleusSettingsModalController;
