import Injectable from 'utils/injectable';

class BranchNucleusModtoolsController extends Injectable {
  constructor (...injections) {
    super(BranchNucleusModtoolsController.$inject, injections);

    const cache = this.LocalStorageService.getObject('cache').modLog || {};

    this.isLoading = true;
    this.log = cache[this.BranchService.branch.id] || [];

    this.getLog = this.getLog.bind(this);

    let listeners = [];

    listeners.push(this.EventService.on(this.EventService.events.CHANGE_BRANCH, this.getLog));

    this.$scope.$on('$destroy', _ => listeners.forEach(deregisterListener => deregisterListener()));
  }

  getLog () {
    if (Object.keys(this.BranchService.branch).length < 2) return;
    
    this.BranchService.getModLog(this.BranchService.branch.id)
      .then(log => this.$timeout(_ => {
        this.log = log;
        this.isLoading = false;

        let cache = this.LocalStorageService.getObject('cache');
        cache.modLog = cache.modLog || {};
        cache.modLog[this.BranchService.branch.id] = this.log;
        this.LocalStorageService.setObject('cache', cache);
      }))
      .catch(_ => {
        this.AlertsService.push('error', 'Error fetching moderator action log.');
        this.isLoading = false;
      });
  }

  openAddModModal () {
    this.ModalService.open('ADD_MOD', { branchid: this.BranchService.branch.id },
      'Successfully updated moderator settings.', 'Error updating moderator settings.');
  }

  openRemoveModModal () {
    let me;
    
    for (let i = 0; i < this.BranchService.branch.mods.length; i++) {
      if (this.BranchService.branch.mods[i].username === this.UserService.user.username) {
        me = this.BranchService.branch.mods[i];
        break;
      }
    }

    // a list of mods to be removed
    // can include self if other mods are present, and
    // removeable others must be added after self
    let removableMods = [];

    for (let i = 0; i < this.BranchService.branch.mods.length; i++) {
      if (this.BranchService.branch.mods[i].username === me.username && this.BranchService.branch.mods.length > 1) {
        removableMods.push(this.BranchService.branch.mods[i]);
      }
      else if (this.BranchService.branch.mods[i].date > me.date) {
        removableMods.push(this.BranchService.branch.mods[i]);
      }
    }

    this.ModalService.open(
      'REMOVE_MOD', {
        branchid: this.BranchService.branch.id,
        mods: removableMods
      }, 'Successfully updated moderator settings.',
      'Error updating moderator settings.');
  }

  openReviewSubbranchRequestsModal () {
    this.ModalService.open('REVIEW_SUBBRANCH_REQUESTS', { branchid: this.BranchService.branch.id },
      'Successfully responded to child branch request.', 'Error responding to child branch request.');
  }

  openSubmitSubbranchRequestModal () {
    this.ModalService.open('SUBMIT_SUBBRANCH_REQUEST', { branchid: this.BranchService.branch.id },
      'Successfully submitted child branch request.', 'Error submitting child branch request.');
  }

  openDeleteBranchModal () {
    this.ModalService.open('DELETE_BRANCH', {},
      'Successfully deleted branch.', 'Error deleting branch.');
  }

  openUpdateHomepageStatsModal () {
    this.ModalService.open('UPDATE_HOMEPAGE_STATS', {},
      'Successfully updated homepage stats.', 'Error updating homepage stats.');
  }
}

BranchNucleusModtoolsController.$inject = [
  '$scope',
  '$timeout',
  'AlertsService',
  'BranchService',
  'EventService',
  'LocalStorageService',
  'ModalService',
  'UserService'
];

export default BranchNucleusModtoolsController;
