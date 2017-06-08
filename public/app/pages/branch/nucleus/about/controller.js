import Injectable from 'utils/injectable';

class BranchNucleusAboutController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusAboutController.$inject, injections);
  }

  isFollowingBranch() {
    if (this.UserService.isAuthenticated()) {
      return this.UserService.user.followed_branches.includes(this.BranchService.branch.id);
    }

    return false;
  }

  toggleFollowBranch() {
     let errorMessage,
      successMessage,
      toggle;
     
     if (this.isFollowingBranch()) {
       errorMessage = 'Error unfollowing branch.';
       successMessage = `You're no longer following this branch!`;
       toggle = this.UserService.unfollowBranch(this.UserService.user.username || 'me', this.BranchService.branch.id);
     }
     else {
       errorMessage = 'Error following branch.';
       successMessage = `You're now following this branch!`;
       toggle = this.UserService.followBranch(this.UserService.user.username || 'me', this.BranchService.branch.id);
     }

     toggle
       .then( _ => this.AlertsService.push('success', successMessage) )
       .catch( _ => this.AlertsService.push('error', errorMessage) );
   }
}

BranchNucleusAboutController.$inject = [
  '$timeout',
  'AlertsService',
  'BranchService',
  'UserService'
];

export default BranchNucleusAboutController;