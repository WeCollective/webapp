import Injectable from 'utils/injectable';

class CreateRePostModalController extends Injectable {
    constructor(...injections) {
        super(CreateRePostModalController.$inject, injections);

        this.errorMessage = '';

        this.isLoading = false;
        this.selectedIndex = 0;

        const listeners = [];

        this.post = this.ModalService.inputArgs.post;
        this.post.branches = []

        listeners.push(this.EventService.on(this.EventService.events.MODAL_OK, name => {
            if (name !== 'REPOST') return;
            if (this.post.branches.length > 0) {
                this.isLoading = true;
                this.ModalService.disabled = true;
                this.PostService.repost(this.post.id,this.post, this.post.branches)
                    .then(() => {
                        this.isLoading = false;
                        this.ModalService.disabled = false;
                        this.ModalService.OK();
                    })
                    .catch(() => {
                        this.isLoading = false;
                        this.ModalService.disabled = false;
                        this.ModalService.Cancel();
                    });

            } else {
                this.close();
            }




        }));

        listeners.push(this.EventService.on(this.EventService.events.MODAL_CANCEL, name => {
            if (name !== 'REPOST') return;
            this.close();
        }));

        this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
    }

    close() {
        this.$timeout(() => {
            this.errorMessage = '';
            this.isLoading = false;
            this.ModalService.Cancel();
        });
    }




}

CreateRePostModalController.$inject = [
    '$scope',
    '$timeout',
    'EventService',
    'ModalService',
    'PostService',
];

export default CreateRePostModalController;