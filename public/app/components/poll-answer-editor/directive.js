import Injectable from 'utils/injectable';

class PollAnswerEditorComponent extends Injectable {
  constructor (...injections) {
    super(PollAnswerEditorComponent.$inject, injections);

    this.restrict = 'E';
    this.replace = 'true';
    this.templateUrl = '/app/components/poll-answer-editor/view.html';
    this.scope = {
      answers: '=',
      title: '&'
    };
  }

  // Params: scope, element, attrs
  link (scope) {
    scope.newAnswer = '';

    scope.addItem = () => {
      // ensure answer doesnt already exist and isn't blank
      if (scope.answers.indexOf(scope.newAnswer) !== -1 || scope.newAnswer === '') {
        return;
      }

      scope.answers.push(scope.newAnswer);
      scope.newAnswer = '';
    };

    scope.removeItem = answer => {
      const itemIndex = scope.answers.indexOf(answer);

      // ensure item exists
      if (itemIndex === -1) return;

      scope.answers.splice(itemIndex, 1);
    };
  }
}

PollAnswerEditorComponent.$inject = [];

export default PollAnswerEditorComponent;