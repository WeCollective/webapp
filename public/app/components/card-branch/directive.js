import Injectable from 'utils/injectable';

class CardBranchComponent extends Injectable {
  constructor (...injections) {
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
    this.templateUrl = '/app/components/card-branch/view.html';
  }
}

CardBranchComponent.$inject = [];

export default CardBranchComponent;
