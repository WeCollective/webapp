import Injectable from 'utils/injectable';

class ModalComponent extends Injectable {
  constructor(...injections) {
    super(ModalComponent.$inject, injections);

    this.replace = false;
    this.restrict = 'A';
    this.scope = {};
    this.templateUrl = '/app/components/modal/view.html';
  }

  link(scope) {
    const { events } = this.EventService;
    scope.handleCancel = () => this.EventService.emit(events.MODAL_CANCEL, this.ModalService.name);
    scope.ModalService = this.ModalService;
    scope.handleSubmit = isDisabled => {
      if (isDisabled) return;
      this.EventService.emit(events.MODAL_OK, this.ModalService.name);
    };
  }
}

ModalComponent.$inject = [
  'EventService',
  'ModalService',
];

export default ModalComponent;
