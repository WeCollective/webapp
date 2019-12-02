import Injectable from 'utils/injectable';

class CardBranchController extends Injectable {
    constructor(...injections) {
        super(CardBranchController.$inject, injections);

    }

    /*cut(description) {
        if (description) {
            return description.slice(0, 150) + "..";
        } else {
            return "No Description :(";
        }

    }*/
}

CardBranchController.$inject = [];

export default CardBranchController;