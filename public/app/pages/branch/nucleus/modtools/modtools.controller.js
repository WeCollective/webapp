import Injectable from 'utils/injectable';

class BranchNucleusModtoolsController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusModtoolsController.$inject, injections);

    this.isLoading = true;

    // $scope.modLog = [];
    // Branch.getModLog($scope.branchid).then(function(log) {
    //   $timeout(function () {
    //     $scope.modLog = log;
    //     $scope.isLoading = false;
    //   });
    // }, function() {
    //   Alerts.push('error', 'Error fetching moderator action log.');
    //   $scope.isLoading = false;
    // });
  }

  openAddModModal() {
    this.ModalService.open(
      '/app/components/modal/branch/nucleus/modtools/add-mod/add-mod.modal.view.html',
      {
        branchid: this.BranchService.branch.id
      },
      'Successfully updated moderator settings.',
      'Error updating moderator settings.'
    );
  }

  openRemoveModModal() {
    let me;
    for(let i = 0; i < this.BranchService.branch.mods.length; i++) {
      if(this.BranchService.branch.mods[i].username === this.UserService.user.username) {
        me = this.BranchService.branch.mods[i];
      }
    }

    // a list of mods to be removed
    // can include self if other mods are present, and
    // removeable others must be added after self
    let removableMods = [];
    for(let i = 0; i < this.BranchService.branch.mods.length; i++) {
      if(this.BranchService.branch.mods[i].username === me.username && this.BranchService.branch.mods.length > 1) {
        removableMods.push(this.BranchService.branch.mods[i]);
      } else if(this.BranchService.branch.mods[i].date > me.date) {
        removableMods.push(this.BranchService.branch.mods[i]);
      }
    }

    this.ModalService.open(
      '/app/components/modal/branch/nucleus/modtools/remove-mod/remove-mod.modal.view.html',
      {
        branchid: this.BranchService.branch.id,
        mods: removableMods
      },
      'Successfully updated moderator settings.',
      'Error updating moderator settings.'
    );
  }

  openReviewSubbranchRequestsModal() {
    this.ModalService.open(
      '/app/components/modal/branch/nucleus/modtools/review-subbranch-requests/review-subbranch-requests.modal.view.html',
      {
        branchid: this.BranchService.branch.id
      },
      'Successfully responded to child branch request.',
      'Error responding to child branch request.'
    );
  }

  openDeleteBranchModal() {
    this.ModalService.open(
      '/app/components/modal/branch/nucleus/modtools/delete-branch/delete-branch.modal.view.html',
      {},
      'Successfully deleted branch.',
      'Error deleting branch.'
    );
  }

  openUpdateHomepageStatsModal() {
    this.ModalService.open(
      '/app/components/modal/branch/nucleus/modtools/update-homepage-stats/update-homepage-stats.modal.view.html',
      {},
      'Successfully updated homepage stats.',
      'Error updating homepage stats.'
    );
  }

}
BranchNucleusModtoolsController.$inject = ['$timeout', 'BranchService', 'UserService', 'EventService', 'ModalService'];

export default BranchNucleusModtoolsController;
