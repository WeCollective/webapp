import Injectable from 'utils/injectable';

class TabsController extends Injectable {
  constructor(...injections) {
    super(TabsController.$inject, injections);
  }

  isSelected(index) {
    return this.$state.current.name === this.states[index];
  }
}

TabsController.$inject = [
  '$state',
  'AlertsService',
];

export default TabsController;
