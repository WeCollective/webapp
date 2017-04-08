import Injectable from 'utils/injectable';

class PollAnswerEditorComponent extends Injectable {
  constructor(...injections) {
    super(PollAnswerEditorComponent.$inject, injections);

    this.restrict = 'E';
    this.replace = 'true';
    this.templateUrl = '/app/components/poll-answer-editor/poll-answer-editor.view.html';
    this.scope = {
      answers: '=',
      title: '&'
    };
  }

  link(scope, element, attrs) {
    scope.newAnswer = '';

    scope.addItem = () => {
      // ensure answer doesnt already exist
      if(scope.answers.indexOf(scope.newAnswer) > -1) {
        return;
      }
      scope.answers.push(scope.newAnswer);
      scope.newAnswer = '';
    };

    scope.removeItem = (answer) => {
      // ensure item exists
      if(scope.answers.indexOf(answer) == -1) {
        return;
      }
      scope.answers.splice(scope.answers.indexOf(answer), 1);
    };
  }
}
PollAnswerEditorComponent.$inject = [];

export default PollAnswerEditorComponent;
