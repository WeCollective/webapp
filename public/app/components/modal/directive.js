import Injectable from 'utils/injectable';

class ModalComponent extends Injectable {
  constructor (...injections) {
    super(ModalComponent.$inject, injections);

    this.replace = false;
    this.restrict = 'A';
    this.scope = {};
    this.templateUrl = '/app/components/modal/view.html';
  }
  
  link (scope) {
    scope.ModalService = this.ModalService;
    scope.OK = _ => this.EventService.emit(this.EventService.events.MODAL_OK, this.ModalService.name);
    scope.Cancel = _ => this.EventService.emit(this.EventService.events.MODAL_CANCEL, this.ModalService.name);
  }
}

ModalComponent.$inject = [
  'EventService',
  'ModalService'
];

export default ModalComponent;
