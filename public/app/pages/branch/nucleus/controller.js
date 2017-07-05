import Injectable from 'utils/injectable';

class BranchNucleusController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusController.$inject, injections);

    this.state = this.getInitialState();

    const init = () => {
      if (!this.$state.current.name.includes('weco.branch.nucleus')) {
        return;
      }

      if (Object.keys(this.BranchService.branch).length < 2) {
        return;
      }

      const branchid = this.BranchService.branch.id;

      this.state = this.getInitialState();

      if (this.UserService.isAuthenticated() && this.isModerator()) {
        // add settings tab
        if (!this.state.tabItems.includes('settings')) {
          this.state.tabItems.push('settings');
          this.state.tabStates.push('weco.branch.nucleus.settings');
          this.state.tabStateParams.push({ branchid });
        }
        
        // add mod tools tab
        if (!this.state.tabItems.includes('mod tools')) {
          this.state.tabItems.push('mod tools');
          this.state.tabStates.push('weco.branch.nucleus.modtools');
          this.state.tabStateParams.push({ branchid });
        }

        // add flagged posts tab
        if (!this.state.tabItems.includes('flagged posts')) {
          this.state.tabItems.push('flagged posts');
          this.state.tabStates.push('weco.branch.nucleus.flaggedposts');
          this.state.tabStateParams.push({ branchid });
        }
      }
      else {
        if (this.$state.current.name !== 'weco.branch.nucleus.about' &&
           this.$state.current.name !== 'weco.branch.nucleus.moderators') {
          this.$state.go('weco.branch.nucleus.about', { branchid }).then(init);
        }
      }
    };

    init();

    let listeners = [];
    
    listeners.push(this.EventService.on(this.EventService.events.CHANGE_BRANCH, init));
    listeners.push(this.EventService.on(this.EventService.events.CHANGE_USER, init));

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
        branchid
      }, {
        branchid
      }],
    };
  }

  isModerator() {
    if (!this.BranchService.branch.mods) return false;

    for (let i = 0; i < this.BranchService.branch.mods.length; i++) {
      if (this.BranchService.branch.mods[i].username === this.UserService.user.username) {
        return true;
      }
    }
    return false;
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
