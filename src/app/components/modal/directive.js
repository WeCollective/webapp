import Injectable from 'utils/injectable';
import View from './view.html';

class ModalComponent extends Injectable {
  constructor(...injections) {
    super(ModalComponent.$inject, injections);

    this.replace = false;
    this.restrict = 'A';
    this.scope = {};
    this.template = View;
  }

  link(scope) {
    scope.handleCancel = () => {
      this.EventService.emit(this.EventService.events.MODAL_CANCEL, this.ModalService.name);
    };
    scope.ModalService = this.ModalService;
    scope.handleSubmit = isDisabled => {
      if (isDisabled) return;
      this.EventService.emit(this.EventService.events.MODAL_OK, this.ModalService.name);
    };
  }
}

ModalComponent.$inject = [
  'EventService',
  'ModalService',
];

export default ModalComponent;
