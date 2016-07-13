'use strict';

var app = angular.module('wecoApp');
app.factory('Mod', ['ModsAPI', '$http', '$state', 'ENV', function(ModsAPI, $http, $state, ENV) {
  var Mod = {};

  Mod.getByBranch = function(branchid) {
    return new Promise(function(resolve, reject) {
      ModsAPI.get({ branchid: branchid }).$promise.catch(function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      }).then(function(mods) {
        if(mods && mods.data) {
          resolve(mods.data);
        } else {
          // successful response contains no branches object:
          // treat as 500 Internal Server Error
          reject({
            status: 500,
            message: 'Something went wrong'
          });
        }
      });
    });
  };

  Mod.create = function(branchid, username) {
    return new Promise(function(resolve, reject) {
      ModsAPI.save({ branchid: branchid }, { username: username })
      .$promise.catch(function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      }).then(function() {
        resolve();
      });
    });
  };

  Mod.delete = function(branchid, username) {
    return new Promise(function(resolve, reject) {
      ModsAPI.delete({ branchid: branchid, username: username })
      .$promise.catch(function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      }).then(function() {
        resolve();
      });
    });
  };

  return Mod;
}]);
