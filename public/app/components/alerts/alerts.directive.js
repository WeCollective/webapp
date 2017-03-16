import Injectable from 'utils/injectable';

class Alerts extends Injectable {
  constructor(...injections) {
    super(Alerts.$inject, injections);

    this.restrict = 'E';
    this.replace = true;
    this.scope = {};
    this.templateUrl = '/app/components/alerts/alerts.view.html';
  }
  link(scope) {
    scope.AlertsService = this.AlertsService;
  }
}
Alerts.$inject = ['AlertsService'];

export default Alerts;
