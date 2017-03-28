import Injectable from 'utils/injectable';

class OnScrollToBottomComponent extends Injectable {
  constructor(...injections) {
    super(OnScrollToBottomComponent.$inject, injections);

    this.restrict = 'A';
  }

  link(scope, element, attrs) {
    element.on('scroll', (e) => {
      if(element[0].scrollTop + element[0].offsetHeight >= element[0].scrollHeight) {
        this.EventService.emit(this.EventService.events.SCROLLED_TO_BOTTOM, attrs.onScrollToBottom);
      }
    });
  }
}
OnScrollToBottomComponent.$inject = ['$timeout', 'EventService'];

export default OnScrollToBottomComponent;
