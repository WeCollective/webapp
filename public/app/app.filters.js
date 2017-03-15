import angular from 'angular';

let AppFilters = {
  // reverse an array
  reverse: () => {
    return function(items) {
      if (!angular.isArray(items)) return false;
      if (!items) { return false; }
      return items.slice().reverse();
    };
  },
  // capitalize a string
  capitalize: () => {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    };
  }
};
export default AppFilters;
