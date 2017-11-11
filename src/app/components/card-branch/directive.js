import Injectable from 'utils/injectable';
import View from './view.html';

class CardBranchComponent extends Injectable {
  constructor(...injections) {
    super(CardBranchComponent.$inject, injections);

    this.bindToController = {
      branch: '=',
      index: '=',
    };
    this.controller = 'CardBranchController';
    this.controllerAs = 'CardBranch';
    this.replace = true;
    this.restrict = 'A';
    this.scope = {};
    this.template = View;
  }
}

CardBranchComponent.$inject = [];

export default CardBranchComponent;
