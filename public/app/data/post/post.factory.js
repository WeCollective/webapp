'use strict';

var app = angular.module('wecoApp');
app.factory('Post', ['PostAPI', '$http', '$state', 'ENV', function(PostAPI, $http, $state, ENV) {
  var Post = {};

  Post.create = function(data) {
    return new Promise(function(resolve, reject) {
      PostAPI.save(data, function() {
        resolve();
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  return Post;
}]);
