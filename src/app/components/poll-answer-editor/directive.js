import Injectable from 'utils/injectable';
import View from './view.html';

class PollAnswerEditorComponent extends Injectable {
  constructor(...injections) {
    super(PollAnswerEditorComponent.$inject, injections);

    this.bindToController = {
      answers: '=',
      title: '@',
    };
    this.controller = 'PollAnswerEditorController';
    this.controllerAs = 'Editor';
    this.replace = true;
    this.restrict = 'E';
    this.scope = {};
    this.template = View;
  }
}

PollAnswerEditorComponent.$inject = [];

export default PollAnswerEditorComponent;
