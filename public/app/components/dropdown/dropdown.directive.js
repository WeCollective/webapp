import Injectable from 'utils/injectable';

class DropdownComponent extends Injectable {
  constructor(...injections) {
    super(DropdownComponent.$inject, injections);

    this.scope = {
      items: '=',
      selected: '=',
      title: '&'
    };
    this.restrict = 'E';
    this.replace = 'true';
    this.templateUrl = '/app/components/dropdown/view.html';
  }

  // Params: scope, element, attrs
  link (scope) {
    scope.isOpen = false;

    scope.close = _ => this.$timeout( _ => scope.isOpen = false );

    scope.open = _ => this.$timeout( _ => scope.isOpen = true );

    scope.select = index => this.$timeout( _ => {
      scope.selected = index;
      scope.close();
    });
  }
}

DropdownComponent.$inject = [
  '$timeout'
];

export default DropdownComponent;