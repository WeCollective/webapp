import angular from 'angular';

const AppFilters = {
  capitalize() {
    return str => {
      if (str) {
        return str[0].toUpperCase() + str.substr(1).toLowerCase();
      }
      return '';
    };
  },

  reverse() {
    return arr => {
      if (!arr || !angular.isArray(arr)) {
        return false;
      }

      return arr.slice().reverse();
    };
  },
};

export default AppFilters;
