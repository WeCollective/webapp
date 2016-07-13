'use strict';

var api = angular.module('api');
api.factory('ModsAPI', ['$resource', 'ENV', function($resource, ENV) {
  return $resource(ENV.apiEndpoint + 'branch/:branchid/mods/:username', {}, {});
}]);
