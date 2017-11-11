import Injectable from 'utils/injectable';
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
  }
}

AlertsComponent.$inject = [
  'AlertsService',
];

export default AlertsComponent;
