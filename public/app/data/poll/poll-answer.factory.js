'use strict';

var app = angular.module('wecoApp');
app.factory('PollAnswer', ['PollAnswerAPI', '$http', '$state', 'ENV', function(PollAnswerAPI, $http, $state, ENV) {
  var PollAnswer = {};

  PollAnswer.get = function(postid, sortBy, lastAnswerId) {
    return new Promise(function(resolve, reject) {
      var params = {
        postid: postid,
        sortBy: sortBy
      };
      if(lastAnswerId) params.lastAnswerId = lastAnswerId;
      PollAnswerAPI.get(params, function(answers) {
        if(!answers || !answers.data) {
          return reject({
            status: 500,
            message: 'Something went wrong'
          });
        }
        resolve(answers.data);
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  PollAnswer.createAnswer = function(data) {
    return new Promise(function(resolve, reject) {
      PollAnswerAPI.save(data, function() {
        resolve();
      }, function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      });
    });
  };

  return PollAnswer;
}]);
