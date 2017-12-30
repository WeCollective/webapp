import Injectable from 'utils/injectable';

class EmitOnScrollToBottomComponent extends Injectable {
  constructor(...injections) {
    super(EmitOnScrollToBottomComponent.$inject, injections);
    this.restrict = 'A';
  }

  link(scope, element) {
    element.on('scroll', () => {
      const el = element[0];

      if (el.scrollTop + el.offsetHeight >= el.scrollHeight) {
        const { events } = this.EventService;
        this.EventService.emit(events.SCROLLED_TO_BOTTOM);
      }
    });
  }
}

EmitOnScrollToBottomComponent.$inject = [
  '$timeout',
  'EventService',
];

export default EmitOnScrollToBottomComponent;
