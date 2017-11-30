import Injectable from 'utils/injectable';

class SidebarComponent extends Injectable {
  constructor(...injections) {
    super(SidebarComponent.$inject, injections);

    this.controller = 'SidebarController';
    this.controllerAs = 'Ctrl';
    this.restrict = 'E';
    this.replace = true;
    this.templateUrl = '/app/components/sidebar/view.html';
  }
}

SidebarComponent.$inject = [];

export default SidebarComponent;
