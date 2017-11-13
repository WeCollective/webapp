import Injectable from 'utils/injectable';

class LoaderBarController extends Injectable {
  constructor(...injections) {
    super(LoaderBarController.$inject, injections);
  }
}

LoaderBarController.$inject = [];

export default LoaderBarController;
