import Injectable from 'utils/injectable';

class BranchNucleusController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusController.$inject, injections);

    this.tabItems = [];
    this.tabStates = [];
    this.tabStateParams = [];

    let isModerator = () => {
      for(let i = 0; i < this.BranchService.branch.mods.length; i++) {
        if(this.BranchService.branch.mods[i].username === this.UserService.user.username) {
          return true;
        }
      }
      return false;
    };

    let init = () => {
      if(this.$state.current.name.indexOf('weco.branch') === -1) return;
      if(Object.keys(this.BranchService.branch).length === 0) return;

      this.tabItems = ['about', 'moderators'];
      this.tabStates = ['weco.branch.nucleus.about', 'weco.branch.nucleus.moderators'];
      this.tabStateParams = [{ branchid: this.BranchService.branch.id }, { branchid: this.BranchService.branch.id }];

      if(this.UserService.isAuthenticated() && isModerator()) {
        // add settings tab
        if(this.tabItems.indexOf('settings') === -1) {
          this.tabItems.push('settings');
          this.tabStates.push('weco.branch.nucleus.settings');
          this.tabStateParams.push({ branchid: this.BranchService.branch.id });
        }
        // add mod tools tab
        if(this.tabItems.indexOf('mod tools') === -1) {
          this.tabItems.push('mod tools');
          this.tabStates.push('weco.branch.nucleus.modtools');
          this.tabStateParams.push({ branchid: this.BranchService.branch.id });
        }
        // add flagged posts tab
        if(this.tabItems.indexOf('flagged posts') === -1) {
          this.tabItems.push('flagged posts');
          this.tabStates.push('weco.branch.nucleus.flaggedposts');
          this.tabStateParams.push({ branchid: this.BranchService.branch.id });
        }
      } else {
        if(this.$state.current.name !== 'weco.branch.nucleus.about' &&
           this.$state.current.name !== 'weco.branch.nucleus.moderators'
        ) {
          this.$state.go('weco.branch.nucleus.about', { branchid: this.BranchService.branch.id }).then(init);
        }
      }
    };

    init();
    this.EventService.on(this.EventService.events.CHANGE_BRANCH, init);
    this.EventService.on(this.EventService.events.CHANGE_USER, init);
  }

  addHTMLLineBreaks(str) {
    if(str) {
      return str.split('\n').join('<br>');
    }
  }
}
BranchNucleusController.$inject = ['$timeout', '$state', 'BranchService', 'UserService', 'EventService'];

export default BranchNucleusController;
