var app = angular.module('wecoApp');
app.controller('modalNucleusRemoveModController', ['$scope', '$timeout', 'Modal', 'Branch', 'User', function($scope, $timeout, Modal, Branch, User) {
  $scope.Modal = Modal;
  $scope.errorMessage = '';
  $scope.isLoading = true;

  $scope.mods = [];
  $scope.selectedMod = {};
  function getMod(username, index) {
    var p = User.get(username);
    p.then(function(data) {
      $timeout(function () {
        $scope.mods[index] = data;
      });
    }, function () {
      // TODO: pretty error
      console.error("Unable to get mod!");
    });
    return p;
  }

  // populate mods array with full mod user data based on the usernames
  // given as an argument to the modal
  var promises = [];
  for(var i = 0; i < Modal.getInputArgs().mods.length; i++) {
    promises.push(getMod(Modal.getInputArgs().mods[i].username, i));
  }
  // when all mods fetched, loading finished
  Promise.all(promises).then(function () {
    $scope.isLoading = false;
  });

  $scope.select = function(mod) {
    $scope.selectedMod = mod;
  };

  $scope.$on('OK', function() {
    $scope.isLoading = true;
    var branchid = Modal.getInputArgs().branchid;
    Branch.removeMod(branchid, $scope.selectedMod.username).then(function() {
      $timeout(function() {
        Modal.OK();
        $scope.selectedMod = {};
        $scope.errorMessage = '';
        $scope.isLoading = false;
      });
    }, function(response) {
      $timeout(function() {
        $scope.errorMessage = response.message;
        if(response.status == 404) {
          $scope.errorMessage = 'That user doesn\'t exist';
        }
        $scope.isLoading = false;
      });
    });
  });

  $scope.$on('Cancel', function() {
    $timeout(function() {
      Modal.Cancel();
      $scope.selectedMod = {};
      $scope.errorMessage = '';
      $scope.isLoading = false;
    });
  });
}]);
