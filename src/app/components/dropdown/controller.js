import Injectable from 'utils/injectable';

class DropdownController extends Injectable {
  constructor(...injections) {
    super(DropdownController.$inject, injections);
    this.$scope.$watch(() => this.selected, value => {
      if (value !== -1) {
        this.active = this.items[value];
      }
    });
  }

  handleChange() {
    this.selected = this.items.indexOf(this.active);
  }
}

DropdownController.$inject = [
  '$scope',
];

export default DropdownController;
