import Injectable from 'utils/injectable';

class DropdownComponent extends Injectable {
  constructor(...injections) {
    super(DropdownComponent.$inject, injections);

    this.restrict = 'E';
    this.replace = 'true';
    this.templateUrl = '/app/components/dropdown/view.html';
    this.scope = {
      title: '&',
      items: '=',
      selected: '='
    };
  }

  // Params: scope, element, attrs
  link (scope) {
    scope.isOpen = false;

    scope.close = () => {
      this.$timeout( () => {
        scope.isOpen = false;
      });
    };

    scope.open = () => {
      this.$timeout( () => {
        scope.isOpen = true;
      });
    };

    scope.select = idx => {
      this.$timeout( () => {
        scope.selected = idx;
        scope.close();
      });
    };
  }
}

DropdownComponent.$inject = [
  '$timeout'
];

export default DropdownComponent;