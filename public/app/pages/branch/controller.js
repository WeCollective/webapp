import Injectable from 'utils/injectable';

class BranchController extends Injectable {
  constructor(...injections) {
    super(BranchController.$inject, injections);

    this.isLoading = Object.keys(this.BranchService.branch).length < 2;

    this.EventService.on(this.EventService.events.CHANGE_BRANCH, () => {
      this.$timeout(() => this.isLoading = false);
    });
  }

  getBreadcrumbsDynamicLink() {
    const viewName = this.$state.current.name;
    let view = '';

    if (viewName.includes('.subbranches')) {
      view = 'subbranches';
    }
    // if (viewName.includes('.wall')) {
    else {
      view = 'wall';
    }

    return `weco.branch.${view}`;
  }

  getHeaderClassName() {
    let className = 'header style--fixed';

    // Post views need taller header for the post preview.
    if (this.$state.current.name.includes('weco.branch.post')) {
      className += ' style--fixed-post';
    }

    return className;
  }

  getLabelFollowButton() {
    if (this.isFollowingBranch()) {
      return 'Unfollow branch';
    }

    return 'Follow branch';
  }

  isControlSelected(control) {
    return this.$state.current.name.includes(control);
  }

  isFollowingBranch() {
    return this.UserService.isAuthenticated() &&
      this.UserService.user.followed_branches.includes(this.BranchService.branch.id);
  }

  isModerator() {
    if (!this.BranchService.branch.mods) {
      return false;
    }

    for (let i = 0; i < this.BranchService.branch.mods.length; i += 1) {
      if (this.BranchService.branch.mods[i].username === this.UserService.user.username) {
        return true;
      }
    }

    return false;
  }

  openModal(modalType) {
    const route = `branch/${this.BranchService.branch.id}/`;
    const messageType = modalType === 'profile-picture' ? 'profile' : 'cover';
    const type = modalType === 'profile-picture' ? 'picture' : 'cover';

    this.ModalService.open(
      'UPLOAD_IMAGE',
      { route, type },
      `Successfully updated ${messageType} picture.`,
      `Unable to update ${messageType} picture.`,
    );
  }

  toggleFollowBranch() {
    let errMsg;
    let promise;
    let successMsg;

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

BranchController.$inject = [
  '$state',
  '$timeout',
  'AlertsService',
  'AppService',
  'BranchService',
  'EventService',
  'ModalService',
  'UserService',
];

export default BranchController;
