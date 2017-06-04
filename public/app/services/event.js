import Injectable from 'utils/injectable';

class EventService extends Injectable {
  constructor (...injections) {
    super(EventService.$inject, injections);

    this.events = {
      CHANGE_BRANCH: 'CHANGE_BRANCH',
      CHANGE_POST: 'CHANGE_POST',
      CHANGE_USER: 'CHANGE_USER',
      MODAL_CANCEL: 'MODAL_CANCEL',
      MODAL_OK: 'MODAL_OK',
      MODAL_OPEN: 'MODAL_OPEN',
      SCROLLED_TO_BOTTOM: 'SCROLLED_TO_BOTTOM',
      STATE_CHANGE_SUCCESS: '$stateChangeSuccess',
      UNREAD_NOTIFICATION_CHANGE: 'UNREAD_NOTIFICATION_CHANGE'
    };
  }

  emit (event, args) {
    for (let i in this.events) {
      if (this.events[i] === event) {
        return this.$rootScope.$broadcast(event, args);
      }
    }
  }

  on (event, callback) {
    this.$rootScope.$on(event, (e, args) => this.$timeout( _ => callback(args) ) );
  }
}

EventService.$inject = [
  '$rootScope',
  '$timeout'
];

export default EventService;