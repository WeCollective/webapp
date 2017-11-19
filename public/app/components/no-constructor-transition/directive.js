import Injectable from 'utils/injectable';

class NoConstructorTransitionComponent extends Injectable {
  constructor(...injections) {
    super(NoConstructorTransitionComponent.$inject, injections);
    this.restrict = 'A';
  }

  link(scope, element, attrs) {
    this.$timeout(() => element[0].classList.remove('no-transition'));
  }
}

NoConstructorTransitionComponent.$inject = [
  '$timeout',
];

export default NoConstructorTransitionComponent;
