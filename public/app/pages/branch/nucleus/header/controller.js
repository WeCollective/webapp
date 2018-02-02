import Injectable from 'utils/injectable';

class BranchNucleusHeaderController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusHeaderController.$inject, injections);

    this.run = 0;
    this.state = this.getInitialState();

    this.renderTabs = this.renderTabs.bind(this);

    const { events } = this.EventService;
    const listeners = [
      this.EventService.on(events.CHANGE_BRANCH, this.renderTabs),
      this.EventService.on(events.CHANGE_USER, this.renderTabs),
    ];
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
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
    if (this.UserService.isAuthenticated() && this.BranchService.isModerator()) {
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

BranchNucleusHeaderController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'BranchService',
  'EventService',
  'HeaderService',
  'UserService',
];

export default BranchNucleusHeaderController;
