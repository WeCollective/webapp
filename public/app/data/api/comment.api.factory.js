var api = angular.module('api');
api.factory('CommentAPI', ['$resource', 'ENV', function($resource, ENV) {
  return $resource(ENV.apiEndpoint + 'post/:postid/comments/:commentid', {
    postid: '@postid',
    commentid: ''
  }, {});
}]);
