'use strict';

var app = angular.module('wecoApp');
app.controller('profileController', ['$scope', '$timeout', '$state', 'User', 'Modal', 'Alerts', function($scope, $timeout, $state, User, Modal, Alerts) {
  $scope.user = {};
  $scope.showCover = true;
  $scope.isLoading = true;

  $scope.showCoverPicture = function() { $scope.showCover = true; };
  $scope.hideCoverPicture = function() { $scope.showCover = false; };

  User.get($state.params.username).then(function(user) {
    $timeout(function() {
      $scope.user = user;
      $scope.isLoading = false;
    });
  }, function(response) {
    if(response.status == 404) {
      $state.go('weco.notfound');
    } else {
      Alerts.push('error', 'Unable to fetch user.');
    }
    $scope.isLoading = false;
  });

  $scope.tabItems = ['about', 'timeline'];
  $scope.tabStates = ['weco.profile.about', 'weco.profile.timeline'];

  // Watch for changes in the auth'd user's username
  // When set, if this is the auth'd user's profile page, add the 'settings' tab
  $scope.$watch(function() {
    return User.me().username;
  }, function(username) {
    if(username == $state.params.username) {
      if($scope.tabItems.indexOf('settings') == -1 && $scope.tabStates.indexOf('weco.profile.settings') == -1) {
        $scope.tabItems.push('settings');
        $scope.tabStates.push('weco.profile.settings');
      }
      if($scope.tabItems.indexOf('notifications') == -1 && $scope.tabStates.indexOf('weco.profile.notifications') == -1) {
        $scope.tabItems.push('notifications');
        $scope.tabStates.push('weco.profile.notifications');
      }
    }
  });

  $scope.openProfilePictureModal = function() {
    Modal.open('/app/components/modals/upload/upload-image.modal.view.html', { route: 'user/me/', type: 'picture' })
      .then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        Alerts.push('error', 'Unable to change profile picture.');
      });
  };

  $scope.openCoverPictureModal = function() {
    Modal.open('/app/components/modals/upload/upload-image.modal.view.html', { route: 'user/me/', type: 'cover' })
      .then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        Alerts.push('error', 'Unable to change cover picture.');
      });
  };

  $scope.isMyProfile = function() {
    return User.me().username == $state.params.username;
  };
}]);
