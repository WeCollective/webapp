import Injectable from 'utils/injectable';

class LoaderBarComponent extends Injectable {
  constructor(...injections) {
    super(LoaderBarComponent.$inject, injections);

    this.bindToController = {
      hidden: '=',
    };
    this.controller = 'LoaderBarController';
    this.controllerAs = 'Loader';
    this.replace = true;
    this.restrict = 'E';
    this.scope = {};
    this.templateUrl = '/app/components/loader-bar/view.html';
  }
}

LoaderBarComponent.$inject = [];

export default LoaderBarComponent;
