import Injectable from 'utils/injectable';

class BranchNucleusAboutController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusAboutController.$inject, injections);
  }

  isFollowingBranch() {
    return this.UserService.isAuthenticated() &&
      this.UserService.user.followed_branches.includes(this.BranchService.branch.id);
  }

  toggleFollowBranch() {
    let errMsg,
      promise,
      successMsg;
     
    if (this.isFollowingBranch()) {
      errMsg = 'Error unfollowing branch.';
      successMsg = `You're no longer following b/${this.BranchService.branch.id}!`;
      promise = this.UserService.unfollowBranch(this.UserService.user.username || 'me', this.BranchService.branch.id);
    }
    else {
      errMsg = 'Error following branch.';
      successMsg = `You're now following b/${this.BranchService.branch.id}!`;
      promise = this.UserService.followBranch(this.UserService.user.username || 'me', this.BranchService.branch.id);
    }

    promise
      .then(() => this.AlertsService.push('success', successMsg))
      .catch(() => this.AlertsService.push('error', errMsg));
   }
}

BranchNucleusAboutController.$inject = [
  'AlertsService',
  'BranchService',
  'UserService',
];

export default BranchNucleusAboutController;
