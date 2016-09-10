var app = angular.module('wecoApp');
app.directive('tooltip', ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    replace: false,
    scope: {
      tooltipText: '&'
    },
    transclude: true,
    templateUrl: '/app/components/tooltip/tooltip.view.html',
    link: function ($scope, element) {
      $scope.show = false;
      var el = element[0];
      var tooltip = el.querySelector('.tooltip');
      var top = 0;
      var left = 0;

      $scope.top = function() {
        return el.offsetTop + 60;
      };
      $scope.left = function() {
        return el.offsetLeft;
      };

      el.addEventListener('mouseover', function () {
        $timeout(function () {
          $scope.show = true;
        });
      }, false);

      el.addEventListener('mouseout', function () {
        $timeout(function () {
          $scope.show = false;
        });
      }, false);
    }
  };
}]);
