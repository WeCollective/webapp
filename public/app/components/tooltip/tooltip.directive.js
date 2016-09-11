var app = angular.module('wecoApp');
app.directive('tooltip', ['$rootScope', function($rootScope) {
  return {
    restrict: 'E',
    replace: false,
    scope: {},
    templateUrl: '/app/components/tooltip/tooltip.view.html',
    link: function ($scope, element) {
      $scope.text = function() {
        return $rootScope.tooltip.text;
      };

      $scope.x = function () { return $rootScope.tooltip.x; };
      $scope.y = function () { return $rootScope.tooltip.y - 20; };
      $scope.show = function () { return $rootScope.tooltip.show; };
    }
  };
}]);

app.directive('tooltipText', ['$rootScope', '$window', '$timeout', function($rootScope, $window, $timeout) {
  return {
    restrict: 'A',
    scope: {
      tooltipText: '='
    },
    link: function ($scope, element) {
      var el = element[0];

      el.addEventListener('mouseover', function () {
        $timeout(function () {
          $rootScope.tooltip.show = true;
          $rootScope.tooltip.text = $scope.tooltipText;
          $rootScope.tooltip.x = el.getBoundingClientRect().left + $window.pageXOffset;
          $rootScope.tooltip.y = el.getBoundingClientRect().top + $window.pageYOffset;
        });
      }, false);

      el.addEventListener('mouseout', function () {
        $timeout(function () {
          $rootScope.tooltip.show = false;
        });
      });
    }
  };
}]);
