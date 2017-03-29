import Injectable from 'utils/injectable';

class ListItemComponent extends Injectable {
  constructor(...injections) {
    super(ListItemComponent.$inject, injections);

    this.restrict = 'A';
    this.replace = true;
    this.scope = {};
    this.bindToController = {
      post: '=',
      index: '=',
      stat: '='
    };
    this.templateUrl = '/app/components/list-item/list-item.view.html';
    this.controllerAs = 'ListItem';
    this.controller = 'ListItemController';
  }
}
ListItemComponent.$inject = [];

export default ListItemComponent;
