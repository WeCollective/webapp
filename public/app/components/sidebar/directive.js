import Injectable from 'utils/injectable';

class SidebarComponent extends Injectable {
  constructor(...injections) {
    super(SidebarComponent.$inject, injections);

    this.controller = 'SidebarController';
    this.controllerAs = 'Ctrl';
    this.replace = true;
    this.restrict = 'E';
    this.templateUrl = () => {
      const { branch } = this.BranchService;
      const path = '/app/components/sidebar';
      const template = branch.id === 'weco-lab' ? 'view-beta' : 'view';
      const url = `${path}/${template}.html`;
      return url;
    };
  }
}

SidebarComponent.$inject = [
  'BranchService',
];

export default SidebarComponent;
