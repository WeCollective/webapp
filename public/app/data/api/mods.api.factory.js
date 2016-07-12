'use strict';

var api = angular.module('api');
api.factory('ModsAPI', ['$resource', 'ENV', function($resource, ENV) {

  function makeFormEncoded(data, headersGetter) {
    var str = [];
    for (var d in data)
      str.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    return str.join("&");
  }

  var Mods = $resource(ENV.apiEndpoint + 'branch/:branchid/mods/:username',
    {
    },
    {
    });

   return Mods;
}]);
