'use strict';

var app = angular.module('wecoApp');
app.factory('Comment', ['CommentAPI', '$http', '$state', 'ENV', function(CommentAPI, $http, $state, ENV) {
  var Comment = {};

  Comment.create = function(data) {
    return new Promise(function(resolve, reject) {
      CommentAPI.save(data, function(response) {
        // pass on the returned commentid
        resolve(response.data);
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  Comment.get = function(postid, commentid) {
    return new Promise(function(resolve, reject) {
      CommentAPI.get({ postid: postid, commentid: commentid }, function(comment) {
        if(!comment || !comment.data) { return reject(); }
        resolve(comment.data);
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  return Comment;
}]);
