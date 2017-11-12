import Injectable from 'utils/injectable';
import Close from 'assets/icons/black/close.png';
import View from './view.html';

class AlertsComponent extends Injectable {
  constructor(...injections) {
    super(AlertsComponent.$inject, injections);

    this.restrict = 'E';
    this.replace = true;
    this.scope = {};
    this.template = View;
  }

  link(scope) {
    scope.AlertsService = this.AlertsService;
    scope.closeIcon = Close;
  }
}

AlertsComponent.$inject = [
  'AlertsService',
];

export default AlertsComponent;
