import Injectable from 'utils/injectable';

class BranchNucleusSettingsModalController extends Injectable {
  constructor (...injections) {
    super(BranchNucleusSettingsModalController.$inject, injections);

    this.onModalCancel = this.onModalCancel.bind(this);
    this.onModalSubmit = this.onModalSubmit.bind(this);
    this.resetState = this.resetState.bind(this);

    this.resetState();

    for (let i = 0; i < this.ModalService.inputArgs.textareas.length; i++) {
      this.textareaValues[i] = this.ModalService.inputArgs.textareas[i].value;
    }
    
    for (let i = 0; i < this.ModalService.inputArgs.inputs.length; i++) {
      this.inputValues[i] = this.ModalService.inputArgs.inputs[i].value;
    }

    let listeners = [];

    listeners.push(this.EventService.on(this.EventService.events.MODAL_OK, this.onModalSubmit));
    listeners.push(this.EventService.on(this.EventService.events.MODAL_CANCEL, this.onModalCancel));

    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  onModalCancel (name) {
    if (name !== 'BRANCH_NUCLEUS_SETTINGS') return;
    this.$timeout(() => this.ModalService.Cancel().then(() => this.resetState()));
  }

  onModalSubmit (name) {
    if (name !== 'BRANCH_NUCLEUS_SETTINGS') return;

    // if not all fields are filled, display message
    if (this.inputValues.length < this.ModalService.inputArgs.inputs.length || this.inputValues.includes('') ||
      this.textareaValues.length < this.ModalService.inputArgs.textareas.length || this.textareaValues.includes('')) {
      this.$timeout(() => this.errorMessage = 'Please fill in all fields');
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
      .then(() => this.$timeout(() => this.ModalService.OK().then(() => this.resetState())))
      .catch(err => this.$timeout(() => this.resetState(err.message)));
  }

  resetState (submitErrorMessage) {
    this.errorMessage = submitErrorMessage || '';
    this.isLoading = false;

    if (!submitErrorMessage) {
      this.inputValues = [];
      this.textareaValues = [];
    }
  }
}

BranchNucleusSettingsModalController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'BranchService',
  'EventService',
  'ModalService',
];

export default BranchNucleusSettingsModalController;
