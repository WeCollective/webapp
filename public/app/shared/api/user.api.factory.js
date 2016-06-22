'use strict';

var api = angular.module('api');
api.factory('UserAPI', ['$resource', 'ENV', function($resource, ENV) {

  var User = $resource(ENV.apiEndpoint + 'user/:id',
    {
      id: 'me'
    },
    {
      login: {
        method: 'POST',
        params: {
          id: 'login'
        },
        // indicate that the data is x-www-form-urlencoded
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        // transform the request to use x-www-form-urlencoded
        transformRequest: function(data, headersGetter) {
          var str = [];
          for (var d in data)
            str.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
          return str.join("&");
        }
      },
      logout: {
        method: 'GET',
        params: {
          id: 'logout'
        }
      },
      signup: {
        method: 'POST',
        params: {
          id: ''
        }
      }
    });

   return User;
}]);
