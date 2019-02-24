import Injectable from 'utils/injectable';

class BranchPostHeaderController extends Injectable {
  constructor(...injections) {
    super(BranchPostHeaderController.$inject, injections);
  }
}

BranchPostHeaderController.$inject = [
  'PostService',
];

export default BranchPostHeaderController;
