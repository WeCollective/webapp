import Injectable from 'utils/injectable';

class SidebarComponent extends Injectable {
  constructor(...injections) {
    super(SidebarComponent.$inject, injections);

    this.controller = 'SidebarController';
    this.controllerAs = 'Ctrl';
    this.replace = true;
    this.restrict = 'E';
    this.templateUrl = (el, attrs) => {
      const { branch } = attrs;

      const path = '/app/components/sidebar';
      let template = 'view';

      if (branch === 'weco-lab') {
        template = 'view-beta';
      }

      const url = `${path}/${template}.html`;
      return url;
    };
  }
}

SidebarComponent.$inject = [
  'BranchService',
];

export default SidebarComponent;
