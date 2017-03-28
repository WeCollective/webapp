import Injectable from 'utils/injectable';

class ListItemComponent extends Injectable {
  constructor(...injections) {
    super(ListItemComponent.$inject, injections);

    this.restrict = 'A';
    this.replace = true;
    this.scope = {
      post: '=',
      index: '=',
      stat: '='
    };
    this.templateUrl = '/app/components/list-item/list-item.view.html';
  }
  link(scope) {
    scope.vote = (post, direction) => {
      this.PostService.vote(this.BranchService.branch.id, post.id, direction).then(() => {
        let inc = (direction === 'up') ? 1 : -1;
        this.$timeout(() => {
          post.individual += inc;
          post.local += inc;
          post.global += inc;
        });
        this.AlertsService.push('success', 'Thanks for voting!');
      }).catch((err) => {
        if(err.status === 400) {
          this.AlertsService.push('error', 'You have already voted on this post.');
        } else if(err.status === 403) {
          this.AlertsService.push('error', 'Please log in or create an account to vote.');
        } else {
          this.AlertsService.push('error', 'Error voting on post.');
        }
      });
    };

    scope.getProxyUrl = (url) => {
      // only proxy http requests, not https
      if(url && url.substring(0, 5) === 'http:') {
        return this.ENV.apiEndpoint + 'proxy?url=' + url;
      } else {
        return url;
      }
    };

    scope.getOriginalBranchesTooltipString = (post) => {
      if(!post.data || !post.data.original_branches) return '';
      let tooltip = '';
      let original_branches = JSON.parse(post.data.original_branches);
      for(let i = 1; i < original_branches.length; i++) {
        tooltip += (original_branches[i] + (i < original_branches.length ? '\n' : ''));
      }
      return tooltip;
    };

    scope.getOriginalBranches = (post) => {
      if(!post.data || !post.data.original_branches) return '';
      return JSON.parse(post.data.original_branches);
    };

    scope.openFlagPostModal = (post) => {
      this.ModalService.open(
        'FLAG_POST_MODAL', {
          post: post,
          branchid: this.BranchService.branch.id
        },
        'Post flagged. The branch moderators will be informed.',
        'Unable to flag post.'
      );
    };
  }
}
ListItemComponent.$inject = ['$timeout', 'PostService', 'BranchService', 'AlertsService', 'ENV'];

export default ListItemComponent;
