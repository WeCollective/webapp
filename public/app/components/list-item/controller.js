import Injectable from 'utils/injectable';

class ListItemController extends Injectable {
  constructor(...injections) {
    super(ListItemController.$inject, injections);
  }

  getOriginalBranches () {
    let branches = [];
    
    if (this.post.data && this.post.data.original_branches) {
      branches = JSON.parse(this.post.data.original_branches);
    }

    return branches;
  }

  getOriginalBranchesTooltipString () {
    const original_branches = this.getOriginalBranches();
    let string = '';

    for (let i = 1; i < original_branches.length; i++) {
      string += original_branches[i] + (i < original_branches.length ? '\n' : '');
    }

    return string;
  }

  getTotalFlagCount () {
    const p = this.post;
    return p.branch_rules_count + p.site_rules_count + p.wrong_type_count + p.nsfw_count;
  }

  isOwnPost () {
    return this.post && this.post.data && this.UserService.user.username === this.post.data.creator;
  }

  openDeletePostModal () {
    this.ModalService.open('DELETE_POST', { postid: this.post.id },
      'Post deleted.', 'Unable to delete post.' );

    this.EventService.on(this.EventService.events.MODAL_OK, name => {
      if ('DELETE_POST' !== name) return;
      this.$state.go(this.$state.current.name, { reload: true });
    });
  }

  openFlagPostModal () {
    this.ModalService.open('FLAG_POST', {
        post: this.post,
        branchid: this.BranchService.branch.id
      },
      'Post flagged. The branch moderators will be informed.',
      'Unable to flag post.');
  }

  openResolveFlagPostModal () {
    this.ModalService.open('RESOLVE_FLAG_POST', { post: this.post },
      'Done.', 'Error resolving flags on post.' );
  }

  showFlags () {
    return this.$state.current.name.includes('weco.branch.nucleus');
  }

  showVotes () {
    return !!this.stat;
  }

  vote (direction) {
    this.PostService.vote(this.BranchService.branch.id, this.post.id, direction)
      .then( _ => {
        const inc = (direction === 'up') ? 1 : -1;

        this.$timeout( _ => {
          this.post.individual += inc;
          this.post.local += inc;
          this.post.global += inc;
        });

        this.AlertsService.push('success', 'Thanks for voting!');
      })
      .catch( err => {
        if (400 === err.status) {
          this.AlertsService.push('error', 'You have already voted on this post.');
        }
        else if (403 === err.status) {
          this.AlertsService.push('error', 'Please log in or create an account to vote.');
        }
        else {
          this.AlertsService.push('error', 'Error voting on post.');
        }
      });
  }
}

ListItemController.$inject = [
  '$state',
  '$timeout',
  'AlertsService',
  'AppService',
  'BranchService',
  'EventService',
  'ModalService',
  'PostService',
  'UserService'
];

export default ListItemController;