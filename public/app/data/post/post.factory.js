'use strict';

var app = angular.module('wecoApp');
app.factory('Post', ['PostAPI', 'BranchPostsAPI', '$http', '$state', 'ENV', function(PostAPI, BranchPostsAPI, $http, $state, ENV) {
  var Post = {};

  // fetch the presigned url for the specified picture for the specified post
  // Returns the promise from $http.
  Post.getPictureUrl = function(id, thumbnail) {
    // fetch signedurl for user profile picture and attach to user object
    return $http({
      method: 'GET',
      url: ENV.apiEndpoint + 'post/' + id + '/picture' + (thumbnail ? '-thumb' : '')
    });
  };

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

        // get the post picture url
        Post.getPictureUrl(postid, false).then(function(response) {
          if(response && response.data && response.data.data) {
            post.data.profileUrl = response.data.data;
          }
          // get the post thumbnail url
          return Post.getPictureUrl(postid, true);
        }).then(function(response) {
          if(response && response.data && response.data.data) {
            post.data.profileUrlThumb = response.data.data;
          }
          resolve(post.data);
        }, function() {
          resolve(post.data);
        });
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  Post.vote = function(branchid, postid, vote) {
    return new Promise(function(resolve, reject) {
      if(vote != 'up' && vote != 'down') { return reject(); }

      BranchPostsAPI.vote({
          branchid: branchid,
          postid: postid
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

  // get the post on a specific branch
  Post.getPostOnBranch = function(postid, branchid) {
    return new Promise(function(resolve, reject) {
      BranchPostsAPI.get({ postid: postid, branchid: branchid }, function(post) {
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
