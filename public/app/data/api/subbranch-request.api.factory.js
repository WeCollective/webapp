var api = angular.module('api');
api.factory('SubbranchRequestAPI', ['$resource', 'ENV', function($resource, ENV) {
  return $resource(ENV.apiEndpoint + 'branch/:branchid/requests/subbranches/:childid', {
    branchid: '@branchid',
    childid: '@childid'
  }, {});
}]);
