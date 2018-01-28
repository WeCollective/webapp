import Injectable from 'utils/injectable';

class PollAnswerEditorComponent extends Injectable {
  constructor(...injections) {
    super(PollAnswerEditorComponent.$inject, injections);

    this.bindToController = {
      answers: '=',
      disabled: '=',
      title: '@',
    };
    this.controller = 'PollAnswerEditorController';
    this.controllerAs = 'Editor';
    this.replace = true;
    this.restrict = 'E';
    this.scope = {};
    this.templateUrl = '/app/components/poll-answer-editor/view.html';
  }
}

PollAnswerEditorComponent.$inject = [];

export default PollAnswerEditorComponent;
