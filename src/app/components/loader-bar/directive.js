import Injectable from 'utils/injectable';
import View from './view.html';

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
    this.template = View;
  }
}

LoaderBarComponent.$inject = [];

export default LoaderBarComponent;
