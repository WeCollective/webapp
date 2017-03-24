import Injectable from 'utils/injectable';

class BranchNucleusAboutController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusAboutController.$inject, injections);
  }

  isFollowingBranch() {
    if(this.UserService.isAuthenticated()) {
      return this.UserService.user.followed_branches.indexOf(this.BranchService.branch.id) > -1;
    } else {
      return false;
    }
  }

  toggleFollowBranch() {
     let toggle, successMessage, errorMessage;
     if(this.isFollowingBranch()) {
       toggle = this.UserService.unfollowBranch(this.BranchService.branch.id);
       successMessage = 'You\'re no longer following this branch!';
       errorMessage = 'Error unfollowing branch.';
     } else {
       toggle = this.UserService.followBranch(this.BranchService.branch.id);
       successMessage = 'You\'re now following this branch!';
       errorMessage = 'Error following branch.';
     }

     toggle.then(() => {
       this.AlertsService.push('success', successMessage);
     }).catch(() => {
       this.AlertsService.push('error', errorMessage);
     });
   }
}
BranchNucleusAboutController.$inject = ['$timeout', 'UserService', 'BranchService', 'AlertsService'];

export default BranchNucleusAboutController;
