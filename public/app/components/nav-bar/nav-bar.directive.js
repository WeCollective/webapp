import Injectable from 'utils/injectable';

class NavBarComponent extends Injectable {
  constructor(...injections) {
    super(NavBarComponent.$inject, injections);

    this.restrict = 'E';
    this.replace = true;
    this.templateUrl = '/app/components/nav-bar/nav-bar.view.html';
    this.controller = 'NavBarController';
    this.controllerAs = 'NavBar';
  }
}
NavBarComponent.$inject = ['UserService', '$state'];

export default NavBarComponent;
