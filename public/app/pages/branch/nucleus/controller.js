import Injectable from 'utils/injectable';

class BranchNucleusController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusController.$inject, injections);

    this.tabItems = [];
    this.tabStates = [];
    this.tabStateParams = [];

    const init = _ => {
      if (!this.$state.current.name.includes('weco.branch.nucleus')) {
        return;
      }

      if (!Object.keys(this.BranchService.branch).length) {
        return;
      }

      const branchid = this.BranchService.branch.id;

      this.tabItems = ['about', 'moderators'];
      this.tabStates = ['weco.branch.nucleus.about', 'weco.branch.nucleus.moderators'];
      this.tabStateParams = [{ branchid }, { branchid }];

      if (this.UserService.isAuthenticated() && this.isModerator()) {
        // add settings tab
        if (!this.tabItems.includes('settings')) {
          this.tabItems.push('settings');
          this.tabStates.push('weco.branch.nucleus.settings');
          this.tabStateParams.push({ branchid });
        }
        
        // add mod tools tab
        if (!this.tabItems.includes('mod tools')) {
          this.tabItems.push('mod tools');
          this.tabStates.push('weco.branch.nucleus.modtools');
          this.tabStateParams.push({ branchid });
        }

        // add flagged posts tab
        if (!this.tabItems.includes('flagged posts')) {
          this.tabItems.push('flagged posts');
          this.tabStates.push('weco.branch.nucleus.flaggedposts');
          this.tabStateParams.push({ branchid });
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

    this.$scope.$on('$destroy', _ => listeners.forEach( deregisterListener => deregisterListener() ));
  }

  addHTMLLineBreaks (str) {
    return str ? str.split('\n').join('<br>') : str;
  }

  isModerator () {
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
  'UserService'
];

export default BranchNucleusController;