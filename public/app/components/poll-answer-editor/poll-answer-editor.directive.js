var app = angular.module('wecoApp');
app.directive('pollAnswerEditor', ['$timeout', function($timeout) {
  return {
    restrict: 'E',
    replace: 'true',
    templateUrl: '/app/components/poll-answer-editor/poll-answer-editor.view.html',
    scope: {
      answers: '=',
      title: '&'
    },
    link: function($scope, element, attrs) {
      $scope.newAnswer = '';

      $scope.addItem = function() {
        // ensure answer doesnt already exist
        if($scope.answers.indexOf($scope.newAnswer) > -1) {
          return;
        }
        $scope.answers.push($scope.newAnswer);
        $scope.newAnswer = '';
      };

      $scope.removeItem = function(answer) {
        // ensure item exists
        if($scope.answers.indexOf(answer) == -1) {
          return;
        }
        $scope.answers.splice($scope.answers.indexOf(answer), 1);
      };
    }
  };
}]);
