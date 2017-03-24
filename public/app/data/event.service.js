import Injectable from 'utils/injectable';

class EventService extends Injectable {
  constructor(...injections) {
    super(EventService.$inject, injections);

    this.events = {
      CHANGE_USER: 'CHANGE_USER',
      MODAL_OK: 'MODAL_OK',
      MODAL_CANCEL: 'MODAL_CANCEL',
      MODAL_OPEN: 'MODAL_OPEN',
      STATE_CHANGE_SUCCESS: '$stateChangeSuccess',
      CHANGE_BRANCH: 'CHANGE_BRANCH'
    };
  }

  emit(event, args) {
    let eventExists = false;
    for(let idx in this.events) {
      if(this.events[idx] === event) {
        eventExists = true;
        break;
      }
    }
    if(eventExists) {
      this.$rootScope.$broadcast(event, args);
    }
  }

  on(event, callback) {
    this.$rootScope.$on(event, (evt, args) => { return this.$timeout(() => {
      callback(args);
    }); });
  }
}
EventService.$inject = ['$rootScope', '$timeout'];

export default EventService;
