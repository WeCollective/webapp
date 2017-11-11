import Injectable from 'utils/injectable';
import View from './view.html';

class ListItemComponent extends Injectable {
  constructor(...injections) {
    super(ListItemComponent.$inject, injections);

    this.bindToController = {
      index: '=',
      post: '=',
      stat: '=',
    };
    this.controller = 'ListItemController';
    this.controllerAs = 'ListItem';
    this.replace = true;
    this.restrict = 'A';
    this.scope = {};
    this.template = View;
  }
}

ListItemComponent.$inject = [];

export default ListItemComponent;
