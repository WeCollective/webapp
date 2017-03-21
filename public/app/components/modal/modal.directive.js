import Injectable from 'utils/injectable';

class ModalComponent extends Injectable {
  constructor(...injections) {
    super(ModalComponent.$inject, injections);

    this.restrict = 'A';
    this.replace = false;
    this.scope = {};
    this.templateUrl = '/app/components/modal/modal.view.html';
  }
  link(scope) {
    scope.ModalService = this.ModalService;
    scope.OK = () => { this.EventService.emit(this.EventService.events.MODAL_OK); };
    scope.Cancel = () => { this.EventService.emit(this.EventService.events.MODAL_CANCEL); };
  }
}
ModalComponent.$inject = ['ModalService', 'EventService'];

export default ModalComponent;
