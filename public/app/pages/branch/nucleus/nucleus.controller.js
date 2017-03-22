import Injectable from 'utils/injectable';

class BranchNucleusController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusController.$inject, injections);

    this.tabItems = ['about', 'moderators'];

    let updateTabs = () => {
      this.$timeout(() => {
        this.tabStates =
          ['weco.branch.nucleus.about({ "branchid": "' + this.BranchService.branch.id + '"})',
           'weco.branch.nucleus.moderators({ "branchid": "' + this.BranchService.branch.id + '"})'];

        if(this.BranchService.branch.mods) {
          for(let i = 0; i < this.BranchService.branch.mods.length; i++) {
            // is the authd user a mod of this branch?
            if(this.BranchService.branch.mods[i].username === this.UserService.user.username) {
              // add settings tab
              if(this.tabItems.indexOf('settings') === -1) {
                this.tabItems.push('settings');
                this.tabStates.push('weco.branch.nucleus.settings({ "branchid": "' + this.BranchService.branch.id + '"})');
              }
              // add mod tools tab
              if(this.tabItems.indexOf('mod tools') === -1) {
                this.tabItems.push('mod tools');
                this.tabStates.push('weco.branch.nucleus.modtools({ "branchid": "' + this.BranchService.branch.id + '"})');
              }
              // add flagged posts tab
              if(this.tabItems.indexOf('flagged posts') === -1) {
                this.tabItems.push('flagged posts');
                this.tabStates.push('weco.branch.nucleus.flaggedposts({ "branchid": "' + this.BranchService.branch.id + '"})');
              }
            }
          }
        }
      });
    };
    updateTabs();

    this.EventService.on(this.EventService.events.CHANGE_BRANCH, updateTabs);
    this.EventService.on(this.EventService.events.CHANGE_USER, updateTabs);
  }

  addHTMLLineBreaks(str) {
    if(str) {
      return str.split('\n').join('<br>');
    }
  }
}
BranchNucleusController.$inject = ['$timeout', 'BranchService', 'EventService'];

export default BranchNucleusController;
