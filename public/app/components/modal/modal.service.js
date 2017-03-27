import Injectable from 'utils/injectable';

class ModalService extends Injectable {
  constructor(...injections) {
    super(ModalService.$inject, injections);

    this.name = '';
    this.templateUrl = '';
    this.isOpen = false;
    this.inputArgs = {};
    this.outputArgs = {};
    this.resolve = () => {};
    this.reject = () => {};
    this.templateUrls = {
      UPLOAD_IMAGE:               '/app/components/modal/upload-image/upload-image.modal.view.html',
      ADD_MOD:                    '/app/components/modal/branch/nucleus/modtools/add-mod/add-mod.modal.view.html',
      REMOVE_MOD:                 '/app/components/modal/branch/nucleus/modtools/remove-mod/remove-mod.modal.view.html',
      REVIEW_SUBBRANCH_REQUESTS:  '/app/components/modal/branch/nucleus/modtools/review-subbranch-requests/review-subbranch-requests.modal.view.html',
      SUBMIT_SUBBRANCH_REQUEST:   '/app/components/modal/branch/nucleus/modtools/submit-subbranch-request/submit-subbranch-request.modal.view.html',
      DELETE_BRANCH:              '/app/components/modal/branch/nucleus/modtools/delete-branch/delete-branch.modal.view.html',
      UPDATE_HOMEPAGE_STATS:      '/app/components/modal/branch/nucleus/modtools/update-homepage-stats/update-homepage-stats.modal.view.html',
      BRANCH_NUCLEUS_SETTINGS:    '/app/components/modal/branch/nucleus/settings/settings.modal.view.html',
      PROFILE_SETTINGS:           '/app/components/modal/profile/settings/settings.modal.view.html'
    };
    this.names = Object.keys(this.templateUrls);
  }

  open(name, args, successMessage, errorMessage) {
    this.name = name;
    // force change the template url so that controllers included on
    // the template are reloaded
    this.templateUrl = '';
    this.$timeout(() => { this.templateUrl = this.templateUrls[name]; });
    this.isOpen = true;
    this.inputArgs = args;
    this.EventService.emit(this.EventService.events.MODAL_OPEN, this.name);

    new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    }).then((result) => {
      // force reload if OK was pressed
      if(result) {
        this.$state.go(this.$state.current, {}, { reload: true });
        this.AlertsService.push('success', successMessage);
      }
    }).catch((err) => {
      this.AlertsService.push('error', errorMessage);
    });
  }

  OK(args) {
    this.$timeout(() => {
      this.isOpen = false;
      if(args) {
        this.outputArgs = args;
      }
      this.name = '';
      this.resolve(true);
    });
  }

  Cancel(args) {
    this.$timeout(() => {
      this.isOpen = false;
      if(args) {
        this.outputArgs = args;
      }
      this.name = '';
      this.resolve(false);
    });
  }

  Error() {
    this.name = '';
    this.reject();
  }
}
ModalService.$inject = ['$timeout', '$state', 'EventService', 'AlertsService'];

export default ModalService;
