var app = angular.module('wecoApp');
app.directive('navBar', ['authFactory', function(authFactory) {
  return {
    restrict: 'E',
    replace: 'true',
    templateUrl: '/app/nav/nav.view.html',
    link: function($scope, element, attrs) {
      $scope.isLoggedIn = authFactory.isLoggedIn;
    }
  };
}]);
