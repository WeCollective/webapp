import Injectable from 'utils/injectable';

class TabsComponent extends Injectable {
  constructor(...injections) {
    super(TabsComponent.$inject, injections);

    this.restrict = 'E';
    this.replace = true;
    this.scope = {};

    /* NB: states specified in 'states' array can be a pure state name, e.g. weco.home,
    **     or they can have parameters, e.g:
    **        weco.branch.subbranches({ "branchid" : "root" })
    **     In the latter case, the parameters must be specified in JSON parsable
    **     format, i.e. with double quotes around property names and values.
    */
    this.bindToController = {
        items: '=',
        states: '=',
        stateParams: '=',
        callbacks: '='
    };
    this.templateUrl = '/app/components/tabs/tabs.view.html';
    this.controllerAs = 'Tabs';
    this.controller = 'TabsController';
  }
}
TabsComponent.$inject = [];

export default TabsComponent;
