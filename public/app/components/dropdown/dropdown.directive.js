import Injectable from 'utils/injectable';

class DropdownComponent extends Injectable {
  constructor(...injections) {
    super(DropdownComponent.$inject, injections);

    this.restrict = 'E';
    this.replace = 'true';
    this.templateUrl = '/app/components/dropdown/dropdown.view.html';
    this.scope = {
      title: '&',
      items: '=',
      selected: '='
    };
  }

  link(scope, element, attrs) {
    scope.isOpen = false;

    scope.open = () => {
      this.$timeout(() => {
        scope.isOpen = true;
      });
    };
    scope.close = () => {
      this.$timeout(() => {
        scope.isOpen = false;
      });
    };
    scope.select = (idx) => {
      this.$timeout(() => {
        scope.selected = idx;
        scope.close();
      });
    };
  }
}
DropdownComponent.$inject = ['$timeout'];

export default DropdownComponent;
