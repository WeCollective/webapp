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
    scope.ModalService = this.ModalService;
  }
}

ModalComponent.$inject = [
  'ModalService',
];

export default ModalComponent;
