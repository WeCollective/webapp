import Injectable from 'utils/injectable';

class ListItemComponent extends Injectable {
  constructor(...injections) {
    super(ListItemComponent.$inject, injections);

    this.bindToController = {
      index: '=',
      post: '=',
      stat: '='
    };
    this.controller = 'ListItemController';
    this.controllerAs = 'ListItem';
    this.replace = true;
    this.restrict = 'A';
    this.scope = {};
    this.templateUrl = '/app/components/list-item/view.html';
  }
}

ListItemComponent.$inject = [];

export default ListItemComponent;