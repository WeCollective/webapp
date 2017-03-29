import Injectable from 'utils/injectable';

class ListItemController extends Injectable {
  constructor(...injections) {
    super(ListItemController.$inject, injections);
  }

  vote(direction) {
    this.PostService.vote(this.BranchService.branch.id, this.post.id, direction).then(() => {
      let inc = (direction === 'up') ? 1 : -1;
      this.$timeout(() => {
        this.post.individual += inc;
        this.post.local += inc;
        this.post.global += inc;
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
  }

  getProxyUrl(url) {
    // only proxy http requests, not https
    if(url && url.substring(0, 5) === 'http:') {
      return this.ENV.apiEndpoint + 'proxy?url=' + url;
    } else {
      return url;
    }
  }

  getOriginalBranchesTooltipString() {
    if(!this.post.data || !this.post.data.original_branches) return '';
    let tooltip = '';
    let original_branches = JSON.parse(this.post.data.original_branches);
    for(let i = 1; i < original_branches.length; i++) {
      tooltip += (original_branches[i] + (i < original_branches.length ? '\n' : ''));
    }
    return tooltip;
  }

  getOriginalBranches() {
    if(!this.post.data || !this.post.data.original_branches) return '';
    return JSON.parse(this.post.data.original_branches);
  }

  getTotalFlagCount() {
    console.log(this.post);
    console.log(this.post.branch_rules_count , this.post.site_rules_count , this.post.wrong_type_count , this.post.nsfw_count);
    return this.post.branch_rules_count + this.post.site_rules_count + this.post.wrong_type_count + this.post.nsfw_count;
  }

  showFlags() {
    return this.$state.current.name.indexOf('weco.branch.nucleus') > -1;
  }

  showVotes() {
    return !!this.stat;
  }

  openFlagPostModal() {
    this.ModalService.open(
      'FLAG_POST_MODAL', {
        post: this.post,
        branchid: this.BranchService.branch.id
      },
      'Post flagged. The branch moderators will be informed.',
      'Unable to flag post.'
    );
  }

  // open resolve-flag-post ?
}
ListItemController.$inject = ['$timeout', '$state', 'PostService', 'BranchService', 'AlertsService', 'ModalService', 'ENV'];

export default ListItemController;
