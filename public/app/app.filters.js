import angular from 'angular';

const AppFilters = {
  capitalize () {
    return input => {
      return !!input ? (input[0].toUpperCase() + input.substr(1).toLowerCase()) : '';
    };
  },

  // reverse an array
  reverse () {
    return items => {
      return (!items || !angular.isArray(items)) ? false : items.slice().reverse();
    };
  },
};

export default AppFilters;
