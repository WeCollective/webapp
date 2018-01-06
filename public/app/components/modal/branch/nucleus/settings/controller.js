import Injectable from 'utils/injectable';

class BranchNucleusSettingsModalController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusSettingsModalController.$inject, injections);

    this.resetState();

    const {
      inputs,
      textareas,
    } = this.ModalService.inputArgs;

    inputs.forEach((x, i) => this.inputValues[i] = x.value);
    textareas.forEach((x, i) => this.textareaValues[i] = x.value);

    const { events } = this.EventService;
    const listeners = [
      this.EventService.on(events.MODAL_OK, this.handleOK.bind(this)),
      this.EventService.on(events.MODAL_CANCEL, this.handleCancel.bind(this)),
    ];
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  handleCancel(name) {
    if (name !== 'BRANCH_NUCLEUS_SETTINGS') return;
    this.$timeout(() => this.ModalService.Cancel().then(() => this.resetState()));
  }

  handleOK(name) {
    if (name !== 'BRANCH_NUCLEUS_SETTINGS') return;

    const {
      inputs,
      textareas,
    } = this.ModalService.inputArgs;

    // construct data to update using the proper fieldnames
    const updateData = {};

    for (let i = 0; i < inputs.length; i += 1) {
      const input = inputs[i];
      const value = this.inputValues[i];

      if (input.required && (value === undefined || value === '')) {
        this.$timeout(() => this.errorMessage = 'Please fill in all fields');
        return;
      }

      updateData[input.fieldname] = value === '' ? null : value;

      // convert date input values to unix timestamp
      if (input.type === 'date') {
        updateData[input.fieldname] = new Date(value).getTime();
      }
    }

    for (let i = 0; i < textareas.length; i += 1) {
      const textarea = textareas[i];
      const value = this.textareaValues[i];

      if (textarea.required && (value === undefined || value === '')) {
        this.$timeout(() => this.errorMessage = 'Please fill in all fields');
        return;
      }

      updateData[textareas[i].fieldname] = value === '' ? null : value;
    }

    // perform the update
    this.isLoading = true;
    this.BranchService.update(this.$state.params.branchid, updateData)
      .then(() => this.$timeout(() => this.ModalService.OK().then(() => this.resetState())))
      .catch(err => this.$timeout(() => this.resetState(err.message)));
  }

  resetState(submitErrorMessage) {
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
