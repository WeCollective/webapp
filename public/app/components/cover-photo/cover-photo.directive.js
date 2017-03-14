var app = angular.module('wecoApp');
app.directive('coverPhoto', ['$state', 'Modal', function($state, Modal) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      imageUrl: '&',
      thumbUrl: '&',
      canEdit: '&',
      isOpen: '=',
    },
    templateUrl: '/app/components/cover-photo/cover-photo.view.html',
    link: function ($scope) {
      $scope.showCoverPicture = function() { $scope.isOpen = true; };
      $scope.hideCoverPicture = function() { $scope.isOpen = false; };

      $scope.hasUrls = function() {
          return Boolean($scope.imageUrl()) && Boolean($scope.thumbUrl());
      };

      $scope.openCoverPictureModal = function() {
        Modal.open('/app/components/modals/upload/upload-image.modal.view.html', { route: 'branch/' + $scope.branchid + '/', type: 'cover' })
          .then(function(result) {
            // reload state to force profile reload if OK was pressed
            if(result) {
              $state.go($state.current, {}, {reload: true});
            }
          }, function() {
            Alerts.push('error', 'Unable to update cover picture.');
          });
      };
    }
  };
}]);
