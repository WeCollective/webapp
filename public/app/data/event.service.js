import Injectable from 'utils/injectable';

class EventService extends Injectable {
  constructor(...injections) {
    super(EventService.$inject, injections);

    this.events = {
      CHANGE_USER: 'CHANGE_USER',
      MODAL_OK: 'MODAL_OK',
      MODAL_CANCEL: 'MODAL_CANCEL'
    };
  }

  emit(event) {
    let eventExists = false;
    for(let idx in this.events) {
      if(this.events[idx] === event) {
        eventExists = true;
        break;
      }
    }
    if(eventExists) {
      this.$rootScope.$broadcast(event);
    }
  }

  on(event, callback) {
    this.$rootScope.$on(event, () => { return this.$timeout(callback); });
  }
}
EventService.$inject = ['$rootScope', '$timeout'];

export default EventService;
