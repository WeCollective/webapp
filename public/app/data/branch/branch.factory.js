'use strict';

var app = angular.module('wecoApp');
app.factory('Branch', ['BranchAPI', 'SubbranchesAPI', 'ModLogAPI', 'SubbranchRequestAPI', 'BranchPostsAPI', '$http', '$state', 'ENV', function(BranchAPI, SubbranchesAPI, ModLogAPI, SubbranchRequestAPI, BranchPostsAPI, $http, $state, ENV) {
  var Branch = {};
  var me = {};

  // fetch the presigned url for the specified picture for the specified branch
  // Returns the promise from $http.
  Branch.getPictureUrl = function(id, type, thumbnail) {
    // if type not specified, default to profile picture
    if(type != 'picture' && type != 'cover') {
      type = 'picture';
    }
    // fetch signedurl for user profile picture and attach to user object
    return $http({
      method: 'GET',
      url: ENV.apiEndpoint + 'branch/' + id + '/' + type + (thumbnail ? '-thumb' : '')
    });
  };

  Branch.get = function(branchid) {
    return new Promise(function(resolve, reject) {
      BranchAPI.get({ branchid: branchid }, function(branch) {
        if(!branch || !branch.data) { return reject(); }
        // Attach the profile picture and cover urls to the branch object if they exist
        Branch.getPictureUrl(branchid, 'picture', false).then(function(response) {
          if(response && response.data && response.data.data) {
            branch.data.profileUrl = response.data.data;
          }
          return Branch.getPictureUrl(branchid, 'picture', true);
        }, function() {
          return Branch.getPictureUrl(branchid, 'picture', true);
        }).then(function(response) {
          if(response && response.data && response.data.data) {
            branch.data.profileUrlThumb = response.data.data;
          }
          return Branch.getPictureUrl(branchid, 'cover', false);
        }, function() {
          return Branch.getPictureUrl(branchid, 'cover', false);
        }).then(function(response) {
          if(response && response.data && response.data.data) {
            branch.data.coverUrl = response.data.data;
          }
          return Branch.getPictureUrl(branchid, 'cover', true);
        }, function() {
          return Branch.getPictureUrl(branchid, 'cover', true);
        }).then(function(response) {
          if(response && response.data && response.data.data) {
            branch.data.coverUrlThumb = response.data.data;
          }
          resolve(branch.data);
        }, function() {
          resolve(branch.data);
        });
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  Branch.update = function(data) {
    return new Promise(function(resolve, reject) {
      BranchAPI.update({ branchid: $state.params.branchid }, data, function() {
        resolve();
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  Branch.create = function(data) {
    return new Promise(function(resolve, reject) {
      BranchAPI.save(data, function() {
        resolve();
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  Branch.delete = function(branchid) {
    return new Promise(function(resolve, reject) {
      BranchAPI.delete({ branchid: branchid }, function() {
        resolve();
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  // Get the root branches
  Branch.getSubbranches = function(branchid, timeafter, sortBy) {
    return new Promise(function(resolve, reject) {
      SubbranchesAPI.get({ branchid: branchid, timeafter: timeafter, sortBy: sortBy }, function(branches) {
        if(branches && branches.data) {
          resolve(branches.data);
        } else {
          reject({
            status: 500,
            message: 'Something went wrong'
          });
        }
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  // Get a branch's mod log
  Branch.getModLog = function(branchid) {
    return new Promise(function(resolve, reject) {
      ModLogAPI.get({ branchid: branchid }, function(log) {
        if(log && log.data) {
          resolve(log.data);
        } else {
          reject({
            status: 500,
            message: 'Something went wrong'
          });
        }
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  // Submit a SubBranch request
  Branch.submitSubbranchRequest = function(parentid, childid) {
    return new Promise(function(resolve, reject) {
      SubbranchRequestAPI.save({ branchid: parentid, childid: childid }, function() {
        resolve();
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  // Get all the subbranch requests on a given branch
  Branch.getSubbranchRequests = function(parentid) {
    return new Promise(function(resolve, reject) {
      SubbranchRequestAPI.getAll({ branchid: parentid }, function(requests) {
        if(requests && requests.data) {
          resolve(requests.data);
        } else {
          reject({
            status: 500,
            message: 'Something went wrong'
          });
        }
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  // Either 'accept' or 'reject' a subbranch request
  Branch.actionSubbranchRequest = function(action, parentid, childid) {
    return new Promise(function(resolve, reject) {
      function error(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      }

      if(action == 'accept') {
        SubbranchRequestAPI.accept({
          branchid: parentid,
          childid: childid
        }, {
          action: action
        }, resolve, error);
      } else if(action == 'reject') {
        SubbranchRequestAPI.reject({
          branchid: parentid,
          childid: childid
        }, {
          action: action
        }, resolve, error);
      } else {
        return reject({
          status: 400,
          message: 'Invalid action'
        });
      }
    });
  };

  // Get all the posts on a given branch submitted after a given time
  Branch.getPosts = function(branchid, timeafter, sortBy, stat, lastPostId) {
    return new Promise(function(resolve, reject) {
      var params = {
        branchid: branchid,
        timeafter: timeafter,
        sortBy: sortBy,
        stat: stat
      };
      if(lastPostId) params.lastPostId = lastPostId;
      BranchPostsAPI.get(params, function(posts) {
        if(posts && posts.data) {
          resolve(posts.data);
        } else {
          reject({
            status: 500,
            message: 'Something went wrong'
          });
        }
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  // Get all the flagged posts on a given branch submitted after a given time
  Branch.getFlaggedPosts = function(branchid, timeafter, sortBy) {
    return new Promise(function(resolve, reject) {
      BranchPostsAPI.get({ branchid: branchid, timeafter: timeafter, sortBy: sortBy, flag: true }, function(posts) {
        if(posts && posts.data) {
          resolve(posts.data);
        } else {
          reject({
            status: 500,
            message: 'Something went wrong'
          });
        }
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  Branch.resolveFlaggedPost = function(branchid, postid, action, data, message) {
    return new Promise(function(resolve, reject) {
      var body = {};
      body.action = action;
      body[(action === 'change_type') ? 'type' : 'reason'] = data;
      body.message = message;
      var url = ENV.apiEndpoint + 'branch/' + branchid + '/posts/' + postid + '/resolve';
      $http.post(url, body).then(resolve, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  return Branch;
}]);
