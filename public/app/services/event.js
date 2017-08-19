import Injectable from 'utils/injectable';

class EventService extends Injectable {
  constructor(...injections) {
    super(EventService.$inject, injections);

    this.events = {
      CHANGE_BRANCH: 'CHANGE_BRANCH',
      CHANGE_BRANCH_PREFETCH: 'CHANGE_BRANCH_PREFETCH',
      CHANGE_POST: 'CHANGE_POST',
      CHANGE_USER: 'CHANGE_USER',
      LOADING_ACTIVE: 'LOADING_ACTIVE',
      LOADING_INACTIVE: 'LOADING_INACTIVE',
      MODAL_CANCEL: 'MODAL_CANCEL',
      MODAL_OK: 'MODAL_OK',
      MODAL_OPEN: 'MODAL_OPEN',
      SCROLLED_TO_BOTTOM: 'SCROLLED_TO_BOTTOM',
      STATE_CHANGE_SUCCESS: '$stateChangeSuccess',
      UNREAD_NOTIFICATION_CHANGE: 'UNREAD_NOTIFICATION_CHANGE',
    };
  }

  emit(event, args) {
    for (let i in this.events) {
      if (this.events[i] === event) {
        return this.$rootScope.$broadcast(event, args);
      }
    }
    console.warn(`Tried to broadcast an undefined event "${event}."`);
  }

  // Returns a deregister function for the listener. Keep it safe to prevent memory leaks!
  on(event, callback) {
    return this.$rootScope.$on(event, (e, args) => this.$timeout(() => callback(args)));
  }
}

EventService.$inject = [
  '$rootScope',
  '$timeout',
];

export default EventService;
