import Injectable from 'utils/injectable';

class ModalService extends Injectable {
    constructor(...injections) {
        super(ModalService.$inject, injections);

        this.disabled = false;
        this.inputArgs = {};
        this.isOpen = false;
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
            REPOST: '/app/components/modal/repost/view.html',
        };
        this.names = Object.keys(this.templateUrls);

        this.handleKey = this.handleKey.bind(this);
    }

    addListeners() {
        document.addEventListener('keydown', this.handleKey);
    }

    Cancel(args) {
        return this.handleControlButtonClick(false, args);
    }

    disableButtons() {
        this.disabled = true;
    }

    enableButtons() {
        this.disabled = false;
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

    handleCancel() {
        const { events } = this.EventService;
        this.disabled = true;
        this.removeListeners();
        return this.EventService.emit(events.MODAL_CANCEL, this.name);
    }

    handleControlButtonClick(isSubmit, args) {
        return this.finished(args, isSubmit)
            .then(args2 => Promise.resolve(args2));
    }

    handleKey(event) {
        // Escape key.
        if (event.which === 27) {
            event.preventDefault();
            this.handleCancel();
        }
    }

    handleSubmit() {
        const { events } = this.EventService;
        this.disabled = true;
        this.EventService.emit(events.MODAL_OK, this.name);
    }

    OK(args) {
        return this.handleControlButtonClick(true, args);
    }

    open(name, args, successMsg, errMsg) {
        this.addListeners();
        this.enableButtons();

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

                new Promise((resolve2, reject2) => {
                        this.resolve = resolve2;
                        this.reject = reject2;
                    })
                    // todo Investigate why this timeout is set to 1500ms.
                    .then(data => this.$timeout(() => {
                        if (data.success) {
                            if (args.forceUpdate) {
                                this.$state.go(this.$state.current, {}, { reload: true });
                            }

                            const message = typeof successMsg === 'function' ? successMsg(data.args) : successMsg;
                            if (message) this.AlertsService.push('success', message);

                            return resolve(this.outputArgs);
                        }
                        return reject(this.outputArgs);
                    }, 1500))
                    .catch(data => {
                        const message = typeof errMsg === 'function' ? errMsg(data.args) : errMsg;
                        if (message) this.AlertsService.push('error', message);
                        return reject(this.outputArgs);
                    });
            });
        });
    }

    removeListeners() {
        document.removeEventListener('keydown', this.handleKey);
    }
}

ModalService.$inject = [
    '$state',
    '$timeout',
    'AlertsService',
    'EventService',
];

export default ModalService;