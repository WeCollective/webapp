'use strict';

var app = angular.module('wecoApp');
app.factory('Branch', ['BranchAPI', 'SubbranchesAPI', '$http', 'ENV', function(BranchAPI, SubbranchesAPI, $http, ENV) {
  var Branch = {};
  var me = {};

  // Get the root branches
  Branch.getRoots = function() {
    return new Promise(function(resolve, reject) {
      SubbranchesAPI.get({ parentid: 'root' }).$promise.catch(function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      }).then(function(branches) {
        if(branches && branches.data) {
          resolve(branches.data);
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

  return Branch;
}]);
