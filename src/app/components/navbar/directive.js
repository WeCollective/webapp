import Injectable from 'utils/injectable';

class NavbarComponent extends Injectable {
  constructor(...injections) {
    super(NavbarComponent.$inject, injections);

    this.controller = 'NavbarController';
    this.controllerAs = 'Navbar';
    this.restrict = 'E';
    this.replace = true;
    this.templateUrl = '/app/components/navbar/view.html';
  }
}

NavbarComponent.$inject = [];

export default NavbarComponent;
