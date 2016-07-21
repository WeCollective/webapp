var api = angular.module('api');
api.factory('SubbranchRequestAPI', ['$resource', 'ENV', function($resource, ENV) {

  function makeFormEncoded(data, headersGetter) {
    var str = [];
    for (var d in data)
      str.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    return str.join("&");
  }

  return $resource(ENV.apiEndpoint + 'branch/:branchid/requests/subbranches/:childid', {
    branchid: '@branchid',
    childid: '@childid'
  }, {
    getAll: {
      method: 'GET',
      params: {
        childid: ''
      },
      // indicate that the data is x-www-form-urlencoded
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      // transform the request to use x-www-form-urlencoded
      transformRequest: makeFormEncoded
    }
  });
}]);
