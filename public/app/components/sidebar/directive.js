import Injectable from 'utils/injectable';

class SidebarComponent extends Injectable {
  constructor(...injections) {
    super(SidebarComponent.$inject, injections);

    this.controller = 'SidebarController';
    this.controllerAs = 'Ctrl';
    this.restrict = 'E';
    this.replace = true;
    this.templateUrl = (el, attrs) => { // eslint-disable-line no-unused-vars
      const { id } = this.BranchService.branch;
      const path = '/app/components/sidebar';
      let template = 'view';
      if (id === 'weco-lab') {
        template = 'view-beta';
      }
      return `${path}/${template}.html`;
    };
  }
}

SidebarComponent.$inject = [
  'BranchService',
];

export default SidebarComponent;
