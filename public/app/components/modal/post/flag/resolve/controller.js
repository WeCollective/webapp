import Injectable from 'utils/injectable';

class ResolveFlagPostModalController extends Injectable {
  constructor(...injections) {
    super(ResolveFlagPostModalController.$inject, injections);

    this.errorMessage = '';
    this.isLoading = false;
    this.text = '';
    this.controls = {
      reason: {
        selectedIndex: 0,
        items: ['VIOLATING BRANCH RULES', 'VIOLATING SITE RULES'],
      },
      resolve: {
        selectedIndex: 0,
        items: ['CHANGE POST TYPE', 'REMOVE POST', 'MARK AS NSFW', 'APPROVE POST'],
      },
      postType: {
        selectedIndex: 0,
        items: ['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'PAGE', 'POLL'],
      },
    };

    const listeners = [];

    listeners.push(this.EventService.on(this.EventService.events.MODAL_OK, name => {
      if (name !== 'RESOLVE_FLAG_POST') return;

      this.isLoading = true;
      this.ModalService.disabled = true;

      const params = this.ModalService.inputArgs;

      let action;
      let data;

      switch (this.controls.resolve.selectedIndex) {
        // change post type
        case 0:
          action = 'change_type';
          data = this.controls.postType.items[this.controls.postType.selectedIndex].toLowerCase();
          break;

        // remove post
        case 1:
          action = 'remove';
          if (this.controls.reason.selectedIndex === 0) {
            data = 'branch_rules';
          }
          else if (this.controls.reason.selectedIndex === 1) {
            data = 'site_rules';
          }
          else {
            this.AlertsService.push('error', 'Unknown reason.');
            return;
          }
          break;

        // mark as nsfw
        case 2:
          action = 'mark_nsfw';
          break;

        // approve post
        case 3:
          action = 'approve';
          break;

        default:
          this.AlertsService.push('error', 'Unknown action.');
          return;
      }

      if (action === 'remove' && !this.text) {
        this.$timeout(() => {
          this.errorMessage = 'Please provide an explanatory message for the OP';
          this.isLoading = false;
          this.ModalService.disabled = false;
        });
        return;
      }

      this.BranchService
        .resolveFlaggedPost(params.post.branchid, params.post.id, action, data, this.text)
        .then(() => this.$timeout(() => {
          this.errorMessage = '';
          this.isLoading = false;
          this.ModalService.disabled = false;
          this.ModalService.OK();
        }))
        .catch(response => this.$timeout(() => {
          this.errorMessage = response.message;
          this.isLoading = false;
          this.ModalService.disabled = false;
        }));
    }));

    listeners.push(this.EventService.on(this.EventService.events.MODAL_CANCEL, name => {
      if (name !== 'RESOLVE_FLAG_POST') return;
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

ResolveFlagPostModalController.$inject = [
  '$scope',
  '$timeout',
  'AlertsService',
  'BranchService',
  'EventService',
  'ModalService',
];

export default ResolveFlagPostModalController;
