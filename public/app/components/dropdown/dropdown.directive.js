var app = angular.module('wecoApp');
app.directive('dropdown', ['$timeout', function($timeout) {
  return {
    restrict: 'E',
    replace: 'true',
    templateUrl: '/app/components/dropdown/dropdown.view.html',
    scope: {
      title: '&',
      items: '=',
      selected: '='
    },
    link: function($scope, element, attrs) {
      $scope.isOpen = false;

      $scope.open = function() {
        $timeout(function () {
          $scope.isOpen = true;
        });
      };
      $scope.close = function() {
        $timeout(function () {
          $scope.isOpen = false;
        });
      };
      $scope.select = function(idx) {
        $timeout(function () {
          $scope.selected = idx;
          $scope.close();
        });
      };
    }
  };
}]);
