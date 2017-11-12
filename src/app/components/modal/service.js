import Injectable from 'utils/injectable';

class ModalService extends Injectable {
  constructor(...injections) {
    super(ModalService.$inject, injections);

    this.inputArgs = {};
    this.isOpen = false;
    this.isSubmitDisabled = false;
    this.name = '';
    this.outputArgs = {};
    this.reject = () => {};
    this.resolve = () => {};
    this.templateUrl = '';
    this.templateUrls = {
      ADD_MOD: '/app/components/modal/branch/nucleus/modtools/mod-add/view.html',
      BAN_USER: '/app/components/modal/branch/nucleus/modtools/ban-user/view.html',
      BRANCH_NUCLEUS_SETTINGS: '/app/components/modal/branch/nucleus/settings/view.html',
      CREATE_BRANCH: '/app/components/modal/branch/create/view.html',
      CREATE_POST: '/app/components/modal/post/create/view.html',
      DELETE_BRANCH: '/app/components/modal/branch/nucleus/modtools/branch-delete/view.html',
      DETACH_BRANCH_CHILD: '/app/components/modal/branch/nucleus/modtools/branch-detach-child/view.html',
      DELETE_COMMENT: '/app/components/modal/comment/delete/view.html',
      DELETE_POST: '/app/components/modal/post/delete/view.html',
      FLAG_POST: '/app/components/modal/post/flag/view.html',
      PROFILE_SETTINGS: '/app/components/modal/profile/settings/view.html',
      REMOVE_MOD: '/app/components/modal/branch/nucleus/modtools/mod-delete/view.html',
      RESOLVE_FLAG_POST: '/app/components/modal/post/flag/resolve/view.html',
      REVIEW_SUBBRANCH_REQUESTS: '/app/components/modal/branch/nucleus/modtools/branch-review/view.html',
      SUBMIT_POLL_ANSWER: '/app/components/modal/post/submit-poll-answer/view.html',
      SUBMIT_SUBBRANCH_REQUEST: '/app/components/modal/branch/nucleus/modtools/branch-request/view.html',
      UPDATE_HOMEPAGE_STATS: '/app/components/modal/branch/nucleus/modtools/homepage-stats/view.html',
      UPLOAD_IMAGE: '/app/components/modal/upload-image/view.html',
    };
    this.names = Object.keys(this.templateUrls);
  }

  Cancel(args) {
    return this.handleControlButtonClick(false, args);
  }

  disableOK() {
    this.isSubmitDisabled = true;
  }

  enableOK() {
    this.isSubmitDisabled = false;
  }

  Error() {
    return new Promise(() => {
      this.name = '';
      this.reject({});
    });
  }

  finished(args, success) {
    return new Promise(resolve => this.$timeout(() => {
      this.isOpen = false;
      this.outputArgs = args;
      this.name = '';
      this.resolve({
        args,
        success,
      });
      return resolve(args);
    }));
  }

  handleControlButtonClick(isSubmit, args) {
    return this.finished(args, isSubmit)
      .then(args => Promise.resolve(args));
  }

  OK(args) {
    return this.handleControlButtonClick(true, args);
  }

  open(name, args, successMsg, errMsg) {
    return new Promise((resolve, reject) => {
      args = args || {};
      // By default, modal triggers state reload on successful completion.
      if (args.forceUpdate === undefined) {
        args.forceUpdate = true;
      }

      this.name = name;
      // force change the template url so that controllers included on
      // the template are reloaded
      this.templateUrl = '';
      this.$timeout(() => {
        this.inputArgs = args;
        this.isOpen = true;
        this.templateUrl = this.templateUrls[name];

        new Promise((resolve, reject) => {
          this.resolve = resolve;
          this.reject = reject;
        })
          // todo Investigate why this timeout is set to 1500ms.
          .then(data => this.$timeout(() => {
            if (data.success) {
              if (args.forceUpdate) {
                this.$state.go(this.$state.current, {}, { reload: true });
              }
              this.AlertsService.push('success', typeof successMsg === 'function' ? successMsg(data.args) : successMsg);
              return resolve(this.outputArgs);
            }
            return reject(this.outputArgs);
          }, 1500))
          .catch(data => {
            this.AlertsService.push('error', typeof errMsg === 'function' ? errMsg(data.args) : errMsg);
            return reject(this.outputArgs);
          });
      });
    });
  }
}

ModalService.$inject = [
  '$state',
  '$timeout',
  'AlertsService',
  'EventService',
];

export default ModalService;