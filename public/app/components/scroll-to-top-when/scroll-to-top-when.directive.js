var app = angular.module('wecoApp');
app.directive("scrollToTopWhen", ['$rootScope', '$timeout', function ($rootScope, $timeout) {
  return {
    link: function($scope, element, attrs) {
      $rootScope.$on(attrs.scrollToTopWhen, function() {
        $timeout(function () {
          angular.element(element)[0].scrollTop = 0;
        });
      });
    }
  };
}]);
