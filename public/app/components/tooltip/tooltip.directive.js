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
      $scope.y = function () { return $rootScope.tooltip.y; };
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
    link: function ($scope, element, attrs) {
      var el = element[0];
      var offsetX = $scope.$eval(attrs.offsetX);
      var offsetY = $scope.$eval(attrs.offsetY);
      if(!offsetX) offsetX = 0;
      if(!offsetY) offsetY = 0;

      el.addEventListener('mouseover', function () {
        $timeout(function () {
          $rootScope.tooltip.show = true;
          $rootScope.tooltip.text = $scope.tooltipText;
          $rootScope.tooltip.x = el.getBoundingClientRect().left + $window.pageXOffset + offsetX;
          $rootScope.tooltip.y = el.getBoundingClientRect().top + $window.pageYOffset + offsetY;
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
