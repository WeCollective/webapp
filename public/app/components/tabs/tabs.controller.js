import Injectable from 'utils/injectable';

class TabsController extends Injectable {
  constructor(...injections) {
    super(TabsController.$inject, injections);
  }
  // returns a boolean indicating whether the tab at the given index is selected
  isSelected(index) {
    // for states with parameters, parse the parameters from the state string
    // (i.e. the text within parentheses)
    let openIdx = this.states()[index].indexOf('(');
    let closeIdx = this.states()[index].indexOf(')');

    // if the specified state has parameters...
    let parsedParams, parsedStateName;
    if(openIdx > -1 && closeIdx > -1) {
      try {
        // parse the parameters from the text between the parentheses
        parsedParams = JSON.parse(this.states()[index].substr(openIdx + 1, this.states()[index].length - openIdx - 2));
        // parse the state name from the text up to the opening parenthesis
        parsedStateName = this.states()[index].substr(0, openIdx);
      } catch(err) {
        console.error("Unable to parse JSON!");
      }
    }

    if(parsedParams && parsedStateName) {
      // if the specified state has parameters, the parsed name and state params must match
      return this.$state.current.name === parsedStateName && JSON.stringify(parsedParams) === JSON.stringify(this.$state.params);
    } else {
      // otherwise, only the state name was given, and it must match the current state
      return this.$state.current.name === this.states()[index];
    }
  }
}
TabsController.$inject = ['$state'];

export default TabsController;
