'use strict';

var api = angular.module('api');
api.factory('SubbranchesAPI', ['$resource', 'ENV', function($resource, ENV) {
  return $resource(ENV.apiEndpoint + 'branch/:branchid/subbranches', {}, {});
}]);
