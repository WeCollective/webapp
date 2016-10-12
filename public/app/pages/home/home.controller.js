var app = angular.module('wecoApp');
app.controller('homeController', ['$scope', '$http', 'ENV', '$timeout', function($scope, $http, ENV, $timeout) {

  $scope.getHomepageImageURL = function() {
    console.log("CALLED");
    if(ENV.name === 'production') {
      return 'https://s3-eu-west-1.amazonaws.com/weco-public-assets/homepage-image.jpg';
    } else {
      return 'https://s3-eu-west-1.amazonaws.com/dev-weco-public-assets/homepage-image.jpg';
    }
  };

  $scope.stats = {
    donation_total: '...',
    raised_total: '...',
    user_count: '...',
    branch_count: '...'
  };

  // fetch current values
  $http({
    method: 'GET',
    url: ENV.apiEndpoint + 'constant/donation_total'
  }).then(function(result) {
    $scope.stats.donation_total = result.data.data.data;
    return $http({
      method: 'GET',
      url: ENV.apiEndpoint + 'constant/raised_total'
    });
  }).then(function(result) {
    $scope.stats.raised_total = result.data.data.data;
    return $http({
      method: 'GET',
      url: ENV.apiEndpoint + 'constant/user_count'
    });
  }).then(function(result) {
    $scope.stats.user_count = result.data.data.data;
    return $http({
      method: 'GET',
      url: ENV.apiEndpoint + 'constant/branch_count'
    });
  }).then(function(result) {
    $timeout(function() {
      $scope.stats.branch_count = result.data.data.data;
    });
  }).catch(function() {
    console.error("Error fetching homepage stats.");
  });
}]);
