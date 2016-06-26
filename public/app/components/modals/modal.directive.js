var app = angular.module('wecoApp');
app.directive('modal', ['Modal', function(Modal) {
  return {
    restrict: 'A',
    replace: false,
    scope: {},
    templateUrl: '/app/components/modals/modal.view.html',
    link: function($scope, elem, attrs) {
      $scope.getTemplateUrl = Modal.templateUrl;
      $scope.isOpen = Modal.isOpen;
      $scope.Cancel = Modal.Cancel;
      $scope.OK = Modal.OK;
    }
  };
}]);
