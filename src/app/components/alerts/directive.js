import Injectable from 'utils/injectable';

class AlertsComponent extends Injectable {
  constructor(...injections) {
    super(AlertsComponent.$inject, injections);

    this.restrict = 'E';
    this.replace = true;
    this.scope = {};
    this.templateUrl = '/app/components/alerts/view.html';
  }

  link(scope) {
    scope.AlertsService = this.AlertsService;
  }
}

AlertsComponent.$inject = [
  'AlertsService',
];

export default AlertsComponent;
