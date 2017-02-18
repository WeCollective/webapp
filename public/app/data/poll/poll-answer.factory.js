'use strict';

var app = angular.module('wecoApp');
app.factory('PollAnswer', ['PollAnswerAPI', '$http', '$state', 'ENV', function(PollAnswerAPI, $http, $state, ENV) {
  var PollAnswer = {};

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
