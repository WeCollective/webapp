import angular from 'angular';

const AppFilters = {
  capitalize() {
    return str => !!str ? (str[0].toUpperCase() + str.substr(1).toLowerCase()) : '';
  },

  reverse() {
    return arr => (!arr || !angular.isArray(arr)) ? false : arr.slice().reverse();
  },
};

export default AppFilters;
