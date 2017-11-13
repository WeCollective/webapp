import Injectable from 'utils/injectable';

class CardPollAnswerComponent extends Injectable {
  constructor (...injections) {
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
    this.templateUrl = '/app/components/card-poll-answer/view.html';
  }
}

CardPollAnswerComponent.$inject = [];

export default CardPollAnswerComponent;
