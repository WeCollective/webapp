import Injectable from 'utils/injectable';

class BranchNucleusController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusController.$inject, injections);

    this.run = 0;
    this.state = this.getInitialState();

    this.renderTabs = this.renderTabs.bind(this);

    const { events } = this.EventService;
    const listeners = [];
    listeners.push(this.EventService.on(events.CHANGE_BRANCH, this.renderTabs));
    listeners.push(this.EventService.on(events.CHANGE_USER, this.renderTabs));
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  addHTMLLineBreaks(str) {
    return str ? str.split('\n').join('<br>') : str;
  }

  getInitialState() {
    const branchid = this.BranchService.branch.id;
    return {
      tabItems: [
        'about',
        'moderators',
      ],
      tabStates: [
        'weco.branch.nucleus.about',
        'weco.branch.nucleus.moderators',
      ],
      tabStateParams: [{
        branchid,
      }, {
        branchid,
      }],
    };
  }

  isModerator() {
    if (!this.BranchService.branch.mods) return false;

    for (let i = 0; i < this.BranchService.branch.mods.length; i += 1) {
      if (this.BranchService.branch.mods[i].username === this.UserService.user.username) {
        return true;
      }
    }

    return false;
  }

  renderTabs() {
    const branchid = this.BranchService.branch.id;
    const publicAccessStates = this.getInitialState().tabStates;
    const state = this.$state.current.name;

    this.run += 1;

    if (!state.includes('weco.branch.nucleus')) {
      return;
    }

    const newState = this.getInitialState();

    // Add moderator tabs.
    if (this.UserService.isAuthenticated() && this.isModerator()) {
      // Settings.
      newState.tabItems.push('settings');
      newState.tabStates.push('weco.branch.nucleus.settings');
      newState.tabStateParams.push({ branchid });

      // Mod tools.
      newState.tabItems.push('mod tools');
      newState.tabStates.push('weco.branch.nucleus.modtools');
      newState.tabStateParams.push({ branchid });

      // Flagged posts.
      newState.tabItems.push('flagged posts');
      newState.tabStates.push('weco.branch.nucleus.flaggedposts');
      newState.tabStateParams.push({ branchid });
    }
    else if (!publicAccessStates.includes(state)) {
      // NB: This would send us to the About page even if we are actually logged in
      // and a moderator. If we are not allowed here, let's redirect the intruder.
      if (this.run === 1 && Object.keys(this.UserService.user).length > 0) return;
      this.$state.go('weco.branch.nucleus.about', { branchid });
    }

    this.state = newState;
  }
}

BranchNucleusController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'BranchService',
  'EventService',
  'UserService',
];

export default BranchNucleusController;
