var api = angular.module('api', ['ngResource']);
api.config(['$httpProvider', function($httpProvider) {
  // must set withCredentials to keep cookies when making API requests
  $httpProvider.defaults.withCredentials = true;
}]);
