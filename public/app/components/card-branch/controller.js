import Injectable from 'utils/injectable';

class CardBranchController extends Injectable {
  constructor(...injections) {
    super(CardBranchController.$inject, injections);
  }
}

CardBranchController.$inject = [];

export default CardBranchController;
