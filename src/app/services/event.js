import Injectable from 'utils/injectable';

class EventService extends Injectable {
    constructor(...injections) {
        super(EventService.$inject, injections);

        this.events = {
            CHANGE_BRANCH: 'CHANGE_BRANCH',
            CHANGE_BRANCH_PREFETCH: 'CHANGE_BRANCH_PREFETCH',
            CHANGE_FILTER: 'CHANGE_FILTER',
            CHANGE_POST: 'CHANGE_POST',
            CHANGE_USER: 'CHANGE_USER',
            LOADING_ACTIVE: 'LOADING_ACTIVE',
            LOADING_INACTIVE: 'LOADING_INACTIVE',
            MARK_ALL_NOTIFICATIONS_READ: 'MARK_ALL_NOTIFICATIONS_READ',
            MODAL_CANCEL: 'MODAL_CANCEL',
            MODAL_OK: 'MODAL_OK',
            POSTS_LOADED: 'POSTS_LOADED',
            SCROLLED_TO_BOTTOM: 'SCROLLED_TO_BOTTOM',
            SEARCH: 'SEARCH',
            STATE_CHANGE_SUCCESS: '$stateChangeSuccess',
            UNREAD_NOTIFICATION_CHANGE: 'UNREAD_NOTIFICATION_CHANGE',
        };
    }

    emit(event, args) {
        for (const i in this.events) { // eslint-disable-line no-restricted-syntax
            if (this.events[i] === event) {
                return this.$rootScope.$broadcast(event, args);
            }
        }
        console.warn(`Tried to broadcast an undefined event "${event}."`);
        return false;
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