import Injectable from 'utils/injectable';
import View from './view.html';

class CardPollAnswerComponent extends Injectable {
  constructor(...injections) {
    super(CardPollAnswerComponent.$inject, injections);

    this.bindToController = {
      answer: '=',
      index: '=',
      selected: '=',
      type: '@',
    };
    this.controller = 'CardPollAnswerController';
    this.controllerAs = 'CardPollAnswer';
    this.replace = true;
    this.restrict = 'A';
    this.scope = {};
    this.template = View;
  }
}

CardPollAnswerComponent.$inject = [];

export default CardPollAnswerComponent;
