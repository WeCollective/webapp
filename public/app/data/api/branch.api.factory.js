'use strict';

var api = angular.module('api');
api.factory('BranchAPI', ['$resource', 'ENV', function($resource, ENV) {

  function makeFormEncoded(data, headersGetter) {
    var str = [];
    for (var d in data)
      str.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    return str.join("&");
  }

  var Branch = $resource(ENV.apiEndpoint + 'branch/:param',
    {
      param: 'root'
    },
    {
    });

   return Branch;
}]);
