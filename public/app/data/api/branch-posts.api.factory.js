var api = angular.module('api');
api.factory('BranchPostsAPI', ['$resource', 'ENV', function($resource, ENV) {
  return $resource(ENV.apiEndpoint + 'branch/:branchid/posts', {
    branchid: '@branchid'
  }, {});
}]);
