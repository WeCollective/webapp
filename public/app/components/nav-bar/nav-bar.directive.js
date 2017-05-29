import Injectable from 'utils/injectable';
import NavBarController from 'components/nav-bar/nav-bar.controller';

class NavBarComponent extends Injectable {
  constructor(...injections) {
    super(NavBarComponent.$inject, injections);

    this.controller = 'NavBarController';
    this.controllerAs = 'NavBar';
    this.restrict = 'E';
    this.replace = true;
    this.templateUrl = '/app/components/nav-bar/view.html';
  }
}
NavBarComponent.$inject = [];

export default NavBarComponent;
