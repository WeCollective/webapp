var api = angular.module('api');
api.factory('PostAPI', ['$resource', 'ENV', function($resource, ENV) {
  return $resource(ENV.apiEndpoint + 'post/:postid', {}, {});
}]);
