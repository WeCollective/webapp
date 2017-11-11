import Injectable from 'utils/injectable';
import View from './view.html';

class NavbarComponent extends Injectable {
  constructor(...injections) {
    super(NavbarComponent.$inject, injections);

    this.controller = 'NavbarController';
    this.controllerAs = 'Navbar';
    this.restrict = 'E';
    this.replace = true;
    this.template = View;
  }
}

NavbarComponent.$inject = [];

export default NavbarComponent;
