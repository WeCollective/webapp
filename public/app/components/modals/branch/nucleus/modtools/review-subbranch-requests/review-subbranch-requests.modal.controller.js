var app = angular.module('wecoApp');
app.controller('modalNucleusReviewSubbranchRequestsController', ['$scope', '$timeout', 'Modal', 'Branch', function($scope, $timeout, Modal, Branch) {
  $scope.Modal = Modal;
  $scope.errorMessage = '';
  $scope.requests = [];
  $scope.isLoading = true;

  // Get the list of requests
  Branch.getSubbranchRequests(Modal.getInputArgs().branchid).then(function(requests) {

    // get a specific branch object and insert into requests array on branch attribute
    function getBranch(branchid, index) {
      var p = Branch.get(branchid);
      p.then(function(data) {
        requests[index].branch = data;
      }, function () {
        // TODO: pretty error
        console.error("Unable to get branch!");
      });
      return p;
    }

    // populate requests array with full branch data based on the childids
    var promises = [];
    for(var i = 0; i < requests.length; i++) {
      promises.push(getBranch(requests[i].childid, i));
    }

    // when all branches fetched, loading finished
    Promise.all(promises).then(function () {
      $timeout(function () {
        $scope.requests = requests;
        $scope.isLoading = false;
      });
    });
  }, function () {
    // TODO: pretty error
    console.error("Unable to get subbranch requests!");
  });


  $scope.action = function(index, action) {
    $scope.isLoading = true;

    Branch.actionSubbranchRequest(action, $scope.requests[index].parentid,
                                  $scope.requests[index].childid).then(function() {
      $timeout(function() {
        $scope.requests.splice(index, 1);
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
  };

  $scope.$on('OK', function() {
    $timeout(function() {
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.OK();
    });
  });

  $scope.$on('Cancel', function() {
    $timeout(function() {
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.Cancel();
    });
  });
}]);
