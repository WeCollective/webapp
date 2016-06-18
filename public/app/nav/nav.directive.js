var app = angular.module('wecoApp');
app.directive('navBar', function() {
  return {
    restrict: 'E',
    replace: 'true',
    templateUrl: '/app/nav/nav.view.html'
  };
});
