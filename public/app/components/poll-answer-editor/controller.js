import Injectable from 'utils/injectable';

class AnswerEditorController extends Injectable {
  constructor(...injections) {
    super(AnswerEditorController.$inject, injections);

    this.answer = '';
  }

  addAnswer() {
    if (this.answers.includes(this.answer) || this.answer === '') {
      return;
    }

    this.answers.push(this.answer);
    this.answer = '';
  }

  removeAnswer(answer) {
    const answerIndex = this.answers.indexOf(answer);

    if (answerIndex !== -1) {
      this.answers.splice(answerIndex, 1);
    }
  }
}

AnswerEditorController.$inject = [];

export default AnswerEditorController;
