import Injectable from 'utils/injectable';

class ModalComponent extends Injectable {
  constructor(...injections) {
    super(ModalComponent.$inject, injections);

    this.restrict = 'E';
    this.replace = false;
    this.scope = {};
    this.templateUrl = '/app/components/modal/modal.view.html';
  }
  link(scope) {
    scope.ModalService = this.ModalService;
  }
}
ModalComponent.$inject = ['ModalService'];

export default ModalComponent;
