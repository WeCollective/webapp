var api = angular.module('api');
api.factory('PollAnswerAPI', ['$resource', 'ENV', function($resource, ENV) {
  return $resource(ENV.apiEndpoint + 'poll/:postid/answer',{
    postid: '@postid'
  }, {});
}]);
