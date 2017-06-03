import Injectable from 'utils/injectable';

class ModalService extends Injectable {
  constructor(...injections) {
    super(ModalService.$inject, injections);

    this.isOpen = false;
    this.inputArgs = {};
    this.name = '';
    this.outputArgs = {};
    this.reject = _ => {};
    this.resolve = _ => {};
    this.templateUrl = '';
    this.templateUrls = {
      ADD_MOD:                   '/app/components/modal/branch/nucleus/modtools/add-mod/view.html',
      BRANCH_NUCLEUS_SETTINGS:   '/app/components/modal/branch/nucleus/settings/view.html',
      CREATE_BRANCH:             '/app/components/modal/branch/create/view.html',
      CREATE_POST:               '/app/components/modal/post/create/view.html',
      DELETE_BRANCH:             '/app/components/modal/branch/nucleus/modtools/delete-branch/view.html',
      DELETE_POST:               '/app/components/modal/post/delete/view.html',
      FLAG_POST:                 '/app/components/modal/post/flag/view.html',
      PROFILE_SETTINGS:          '/app/components/modal/profile/settings/view.html',
      REMOVE_MOD:                '/app/components/modal/branch/nucleus/modtools/remove-mod/view.html',
      RESOLVE_FLAG_POST:         '/app/components/modal/post/flag/resolve/view.html',
      REVIEW_SUBBRANCH_REQUESTS: '/app/components/modal/branch/nucleus/modtools/review-subbranch-requests/view.html',
      SUBMIT_POLL_ANSWER:        '/app/components/modal/post/submit-poll-answer/view.html',
      SUBMIT_SUBBRANCH_REQUEST:  '/app/components/modal/branch/nucleus/modtools/submit-subbranch-request/view.html',
      UPDATE_HOMEPAGE_STATS:     '/app/components/modal/branch/nucleus/modtools/update-homepage-stats/view.html',
      UPLOAD_IMAGE:              '/app/components/modal/upload-image/view.html',
    };
    this.names = Object.keys(this.templateUrls);
  }

  Cancel (args) {
    this.finished(args, false);
  }

  Error () {
    this.name = '';
    this.reject();
  }

  finished (args, success) {
    this.$timeout( _ => {
      this.isOpen = false;
      if (args) {
        this.outputArgs = args;
      }
      this.name = '';
      this.resolve(success);
    });
  }

  OK (args) {
    this.finished(args, true);
  }

  open (name, args, successMessage, errorMessage) {
    this.name = name;
    // force change the template url so that controllers included on
    // the template are reloaded
    this.templateUrl = '';
    this.$timeout( _ => this.templateUrl = this.templateUrls[name] );
    this.isOpen = true;
    this.inputArgs = args;
    this.EventService.emit(this.EventService.events.MODAL_OPEN, this.name);

    new Promise( (resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    })
      .then( result => {
        // force reload if OK was pressed
        if (result) {
          this.$state.go(this.$state.current, {}, { reload: true });
          this.AlertsService.push('success', successMessage);
        }
      })
      .catch( _ => this.AlertsService.push('error', errorMessage) );
  }
}

ModalService.$inject = [
  '$state',
  '$timeout',
  'AlertsService',
  'EventService'
];

export default ModalService;