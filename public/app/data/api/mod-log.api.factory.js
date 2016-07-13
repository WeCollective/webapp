'use strict';

var api = angular.module('api');
api.factory('ModLogAPI', ['$resource', 'ENV', function($resource, ENV) {
  return $resource(ENV.apiEndpoint + 'branch/:branchid/modlog', {}, {});
}]);
