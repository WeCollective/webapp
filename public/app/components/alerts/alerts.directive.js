var app = angular.module('wecoApp');
app.directive('alerts', ['$timeout', 'Alerts', function($timeout, Alerts) {
  return {
    restrict: 'E',
    replace: true,
    scope: {

    },
    templateUrl: '/app/components/alerts/alerts.view.html',
    link: function ($scope) {
      $scope.alerts = Alerts.get;
      $scope.close = Alerts.close;
    }
  };
}]);
