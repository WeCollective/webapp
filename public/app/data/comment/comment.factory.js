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

  // get the comments on a post or replies to another comment
  // if countOnly, will only return the _number_ of comments
  Comment.getMany = function(postid, parentid, countOnly, sortBy) {
    return new Promise(function(resolve, reject) {
      CommentAPI.get({ postid: postid, parentid: parentid, count: countOnly, sort: sortBy }, function(comments) {
        if(!comments || !comments.data) { return reject(); }
        resolve(comments.data);
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

  Comment.vote = function(postid, commentid, vote) {
    return new Promise(function(resolve, reject) {
      if(vote != 'up' && vote != 'down') { return reject(); }

      CommentAPI.vote({
          postid: postid,
          commentid: commentid
        },{
          vote: vote
        }, function() {
          resolve();
        }, function(response) {
          reject({
            status: response.status,
            message: response.data.message
          });
        });
    });
  };

  Comment.update = function(postid, commentid, text) {
    return new Promise(function(resolve, reject) {
      CommentAPI.update({
        postid: postid,
        commentid: commentid
      }, {
        text: text
      }, function() {
        resolve();
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
