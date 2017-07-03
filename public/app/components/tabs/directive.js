import Injectable from 'utils/injectable';

class TabsComponent extends Injectable {
  constructor(...injections) {
    super(TabsComponent.$inject, injections);

    /* NB: states specified in 'states' array can be a pure state name, e.g. weco.home,
    **     or they can have parameters, e.g:
    **        weco.branch.subbranches({ "branchid" : "root" })
    **     In the latter case, the parameters must be specified in JSON parsable
    **     format, i.e. with double quotes around property names and values.
    */
    this.bindToController = {
      callbacks: '=',
      items: '=',
      stateParams: '=',
      states: '=',
    };
    this.controller = 'TabsController';
    this.controllerAs = 'Tabs';
    this.replace = true;
    this.restrict = 'E';
    this.scope = {};
    this.templateUrl = '/app/components/tabs/view.html';
  }
}

TabsComponent.$inject = [];

export default TabsComponent;
