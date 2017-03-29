import Injectable from 'utils/injectable.js';

class ResolveFlagPostModalController extends Injectable {
  constructor(...injections) {
    super(ResolveFlagPostModalController.$inject, injections);

    this.errorMessage = '';
    this.isLoading = false;
    this.text = { reason: '' };
    this.controls = {
      reason: {
        selectedIndex: 0,
        items: ['VIOLATING BRANCH RULES', 'VIOLATING SITE RULES']
      },
      resolve: {
        selectedIndex: 0,
        items: ['CHANGE POST TYPE', 'REMOVE POST', 'MARK AS NSFW', 'APPROVE POST']
      },
      postType: {
        selectedIndex: 0,
        items: ['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'PAGE', 'POLL']
      }
    };

    this.EventService.on(this.EventService.events.MODAL_OK, (name) => {
      if(name !== 'RESOLVE_FLAG_POST_MODAL') return;

      this.isLoading = true;
      let action, data;
      switch(this.controls.resolve.selectedIndex) {
        case 0: // change post type
          action = 'change_type';
          data = this.controls.postType.items[this.controls.postType.selectedIndex].toLowerCase();
          break;
        case 1: // remove post
          action = 'remove';
          if(this.controls.reason.selectedIndex === 0) {
            data = 'branch_rules';
          } else if(this.controls.reason.selectedIndex === 1) {
            data = 'site_rules';
          } else {
            this.AlertsService.push('error', 'Unknown reason.');
            return;
          }
          break;
        case 2: // mark as nsfw
          action = 'mark_nsfw';
          break;
        case 3: // approve post
          action = 'approve';
          break;
        default:
          this.AlertsService.push('error', 'Unknown action.');
          return;
      }

      if(action === 'remove' && (!this.text.reason || this.text.reason.length === 0)) {
        return this.$timeout(() => {
          this.errorMessage = 'Please provide an explanatory message for the OP';
          this.isLoading = false;
        });
      }

      this.BranchService.resolveFlaggedPost(this.ModalService.inputArgs.post.branchid, this.ModalService.inputArgs.post.id, action, data, this.text.reason).then(() => {
        this.$timeout(() => {
          this.errorMessage = '';
          this.isLoading = false;
          this.ModalService.OK();
        });
      }).catch((response) => {
        this.$timeout(() => {
          this.errorMessage = response.message;
          this.isLoading = false;
        });
      });
    });

    this.EventService.on(this.EventService.events.MODAL_CANCEL, (name) => {
      if(name !== 'RESOLVE_FLAG_POST_MODAL') return;
      this.$timeout(() => {
        this.errorMessage = '';
        this.isLoading = false;
        this.ModalService.Cancel();
      });
    });
  }

  close() {
    this.$timeout(() => {
      this.errorMessage = '';
      this.isLoading = false;
      this.ModalService.Cancel();
    });
  }
}
ResolveFlagPostModalController.$inject = ['$timeout', 'ModalService', 'BranchService', 'AlertsService', 'EventService'];

export default ResolveFlagPostModalController;
