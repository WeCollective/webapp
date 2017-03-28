import Injectable from 'utils/injectable';

class ListItemComponent extends Injectable {
  constructor(...injections) {
    super(ListItemComponent.$inject, injections);

    this.restrict = 'A';
    this.replace = true;
    this.scope = {
      post: '=',
      index: '='
    };
    this.templateUrl = '/app/components/list-item/list-item.view.html';
  }
  link(scope) {
    console.log(scope.post);
  }
}
ListItemComponent.$inject = [];

export default ListItemComponent;
