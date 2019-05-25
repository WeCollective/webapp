import Injectable from 'utils/injectable';

class AnswerEditorController extends Injectable {
  constructor(...injections) {
    super(AnswerEditorController.$inject, injections);

    this.answer = '';
  }

  addAnswer() {
    const { answer } = this;

    if (answer === undefined || answer === '') {
      return;
    }

    this.answers = [
      ...this.answers,
      answer,
    ];
    this.answer = '';
  }

  removeAnswer(index) {
    this.answers = [
      ...this.answers.slice(0, index),
      ...this.answers.slice(index + 1),
    ];
  }
}

AnswerEditorController.$inject = [];

export default AnswerEditorController;
