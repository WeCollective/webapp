var app = angular.module('wecoApp');
app.directive('tabs', ['$state', function($state) {
  return {
    restrict: 'E',
    replace: 'true',
    scope: {
      items: '&',
      states: '&',
      callbacks: '='
    },
    templateUrl: '/app/components/tabs/tabs.view.html',
    link: function($scope, element, attrs) {
      /* NB: states specified in '$scope.states' can be a pure state name, e.g. weco.home,
      **     or they can have parameters, e.g:
      **        weco.branch.subbranches({ "branchid" : "root", "filter": "alltime" })
      **     In the latter case, the parameters must be specified in JSON parsable
      **     format, i.e. with double quotes around property names and values.
      */

      // returns a boolean indicating whether the tab at the given index is selected
      $scope.isSelected = function(index) {
        // for states with parameters, parse the parameters from the state string
        // (i.e. the text within parentheses)
        var openIdx = $scope.states()[index].indexOf('(');
        var closeIdx = $scope.states()[index].indexOf(')');

        // if the specified state has parameters...
        var parsedParams, parsedStateName;
        if(openIdx > -1 && closeIdx > -1) {
          try {
            // parse the parameters from the text between the parentheses
            parsedParams = JSON.parse($scope.states()[index].substr(openIdx + 1, $scope.states()[index].length - openIdx - 2));
            // parse the state name from the text up to the opening parenthesis
            parsedStateName = $scope.states()[index].substr(0, openIdx);
          } catch(err) {
            console.error("Unable to parse JSON!");
          }
        }

        if(parsedParams && parsedStateName) {
          // if the specified state has parameters, the parsed name and state params must match
          return $state.current.name == parsedStateName && JSON.stringify(parsedParams) == JSON.stringify($state.params);
        } else {
          // otherwise, only the state name was given, and it must match the current state
          return $state.current.name == $scope.states()[index];
        }
      };
    }
  };
}]);
