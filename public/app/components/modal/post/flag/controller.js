import Injectable from 'utils/injectable';

class FlagPostModalController extends Injectable {
  constructor(...injections) {
    super(FlagPostModalController.$inject, injections);

    this.errorMessage = '';
    this.flagItems = [
      'AGAINST BRANCH RULES',
      'AGAINST SITE RULES',
      `NOT A ${this.ModalService.inputArgs.post.type.toUpperCase()} POST`,
    ];
    this.isLoading = false;
    this.selectedIndex = 0;

    if (!this.ModalService.inputArgs.post.nsfw) {
      this.flagItems.push('NSFW');
    }

    const listeners = [];

    listeners.push(this.EventService.on(this.EventService.events.MODAL_OK, name => {
      if (name !== 'FLAG_POST') return;

      this.isLoading = true;

      let post = this.ModalService.inputArgs.post;
      let type;

      switch (this.selectedIndex) {
        case 0:
          type = 'branch_rules';
          break;

        case 1:
          type = 'site_rules';
          break;

        case 2:
          type = 'wrong_type';
          break;

        case 3:
          type = 'nsfw';
          break;

        default:
          this.errorMessage = 'Unknown flag type.';
          this.isLoading = false;
          return;
      }

      this.PostService.flag(post.id, this.ModalService.inputArgs.branchid, type)
        .then(() => this.$timeout(() => {
          this.errorMessage = '';
          this.isLoading = false;
          this.ModalService.OK();
        }))
        .catch(response => this.$timeout(() => {
          this.errorMessage = response.message;
          this.isLoading = false;
        }));
    }));

    listeners.push(this.EventService.on(this.EventService.events.MODAL_CANCEL, name => {
      if (name !== 'FLAG_POST') return;

      this.$timeout(() => {
        this.errorMessage = '';
        this.isLoading = false;
        this.ModalService.Cancel();
      });
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

FlagPostModalController.$inject = [
  '$scope',
  '$timeout',
  'EventService',
  'ModalService',
  'PostService',
];

export default FlagPostModalController;
