import Injectable from 'utils/injectable';
import NavBarController from 'components/nav-bar/nav-bar.controller';

class NavBarComponent extends Injectable {
  constructor(...injections) {
    super(NavBarComponent.$inject, injections);

    this.restrict = 'E';
    this.replace = true;
    this.templateUrl = '/app/components/nav-bar/nav-bar.view.html';
    this.controllerAs = 'NavBar';
    this.controller = 'NavBarController';
  }
}
NavBarComponent.$inject = [];

export default NavBarComponent;
