var app = angular.module('wecoApp');
app.directive('tagEditor', ['$timeout', function($timeout) {
  return {
    restrict: 'E',
    replace: 'true',
    templateUrl: '/app/components/tag-editor/tag-editor.view.html',
    scope: {
      items: '=',
      title: '&',
      max: '&'
    },
    link: function($scope, element, attrs) {
      $scope.errorMessage = '';
      $scope.data = {};

      $scope.addItem = function() {
        $scope.errorMessage = '';

        // ensure not already at max number of items
        if($scope.items.length >= $scope.max()) {
          return;
        }

        // ensure item exists
        if(!$scope.data.item) {
          return;
        }

        // ensure item doesn't contan whitespace
        if(/\s/g.test($scope.data.item)) {
          $scope.errorMessage = 'Cannot contain spaces.';
          return;
        }

        // convert to all lowercase
        $scope.data.item = $scope.data.item.toLowerCase();

        // ensure not already in list
        if($scope.items.indexOf($scope.data.item) > -1) {
          return;
        }

        // add to list and clear textbox
        $scope.items.push($scope.data.item);
        $scope.data.item = undefined;
      };

      $scope.removeItem = function(item) {
        $scope.errorMessage = '';
        
        if($scope.items.indexOf(item) > -1) {
          $scope.items.splice($scope.items.indexOf(item), 1);
        }
      };
    }
  };
}]);
