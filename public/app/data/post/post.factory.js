'use strict';

var app = angular.module('wecoApp');
app.factory('Post', ['PostAPI', '$http', '$state', 'ENV', function(PostAPI, $http, $state, ENV) {
  var Post = {};

  Post.create = function(data) {
    return new Promise(function(resolve, reject) {
      PostAPI.save(data, function(response) {
        // pass on the returned postid
        resolve(response.data);
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  Post.get = function(postid) {
    return new Promise(function(resolve, reject) {
      PostAPI.get({ postid: postid }, function(post) {
        if(!post || !post.data) { return reject(); }
        resolve(post.data);
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
