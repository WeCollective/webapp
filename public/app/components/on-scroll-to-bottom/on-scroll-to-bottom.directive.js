import Injectable from 'utils/injectable';

class OnScrollToBottomComponent extends Injectable {
  constructor(...injections) {
    super(OnScrollToBottomComponent.$inject, injections);

    this.restrict = 'A';
  }

  link(scope, element, attrs) {
    let fn = scope.$eval(attrs.onScrollToBottom);
    element.on('scroll', (e) => {
      if(element[0].scrollTop + element[0].offsetHeight >= element[0].scrollHeight) {
        scope.$apply(fn);
      }
    });
  }
}
OnScrollToBottomComponent.$inject = ['$timeout'];

export default OnScrollToBottomComponent;
