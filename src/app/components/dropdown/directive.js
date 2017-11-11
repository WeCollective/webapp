import Injectable from 'utils/injectable';
import View from './view.html';

class DropdownComponent extends Injectable {
  constructor(...injections) {
    super(DropdownComponent.$inject, injections);

    this.bindToController = {
      class: '@',
      items: '=',
      postTypes: '@',
      selected: '=',
      title: '@',
    };
    this.controller = 'DropdownController';
    this.controllerAs = 'Dropdown';
    this.replace = true;
    this.restrict = 'E';
    this.scope = true;
    this.template = View;
  }
}

DropdownComponent.$inject = [];

export default DropdownComponent;
