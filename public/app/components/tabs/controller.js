import Injectable from 'utils/injectable';

class TabsController extends Injectable {
  constructor(...injections) {
    super(TabsController.$inject, injections);
  }
  // returns a boolean indicating whether the tab at the given index is selected
  isSelected(index) {
    return this.$state.current.name === this.states[index];
  }
}
TabsController.$inject = ['$state', 'AlertsService'];

export default TabsController;
