import Injectable from 'utils/injectable';

class TabsController extends Injectable {
  constructor(...injections) {
    super(TabsController.$inject, injections);
  }

  getLink(index) {
    const state = Array.isArray(this.states[index]) ? this.states[index][0] : this.states[index];
    const params = this.stateParams[index];
    return this.$state.href(state, params);
  }

  isSelected(index) {
    if (Array.isArray(this.states[index])) {
      return this.states[index].includes(this.$state.current.name);
    }

    return this.states[index] === this.$state.current.name;
  }
}

TabsController.$inject = [
  '$state',
  'AlertsService',
];

export default TabsController;
