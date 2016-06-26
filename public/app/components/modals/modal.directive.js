var app = angular.module('wecoApp');
app.directive('modal', ['Modal', function(Modal) {
  return {
    restrict: 'E',
    scope: {},
    templateUrl: '/app/components/modals/modal.view.html',
    link: function($scope, elem, attrs) {
      $scope.templateUrl = Modal.templateUrl;
      $scope.isOpen = Modal.isOpen;

      Modal.show('/app/components/modals/modal.test.view.html');
    }
  };
}]);
