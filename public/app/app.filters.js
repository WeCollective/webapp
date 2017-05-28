import angular from 'angular';

const AppFilters = {
  // capitalize a string
  capitalize: () => {
    return input => {
      return !!input ? (input[0].toUpperCase() + input.substr(1).toLowerCase()) : '';
    };
  },

  // reverse an array
  reverse: () => {
    return items => {
      if (!items || !angular.isArray(items)) {
        return false;
      }
      
      return items.slice().reverse();
    };
  },
};

export default AppFilters;