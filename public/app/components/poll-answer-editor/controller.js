import Injectable from 'utils/injectable';

class AnswerEditorController extends Injectable {
  constructor(...injections) {
    super(AnswerEditorController.$inject, injections);

    this.answer = '';
  }

  addAnswer() {
    if (this.answer === undefined || this.answer === '') {
      return;
    }

    this.answers.push(this.answer);
    this.answer = '';
  }

  removeAnswer(index) {
    this.answers.splice(index, 1);
  }
}

AnswerEditorController.$inject = [];

export default AnswerEditorController;
