import Injectable from 'utils/injectable';

class WallService extends Injectable {
  constructor(...injections) {
    super(WallService.$inject, injections);

    this.isCoverOpen = false;
  }

  getHeaderButtonTooltip() {
    switch (this.$state.current.name) {
      case 'weco.branch.subbranches':
        return 'Create new branch';

      case 'weco.branch.wall':
        return 'Create new post';

      case 'weco.branch.post':
        return 'Write a Comment';

      default:
        return '';
    }
  }



  /*rotateSidebarToggleButton() {
    var x = document.getElementById("toggle-button");

    document.onclick = function() {     
      if (x.className == "icon toggle-in") {
          x.className = "icon toggle-out";
      } else if (x.className == "icon toggle-out") {
          x.className = "icon toggle-in";
      }
    }
  }*/

  handleHeaderButtonClick() {
    const branchid = this.BranchService.branch.id;
    const params = { branchid };
    let errMsg;
    let name;
    let successMsg;

    switch (this.$state.current.name) {
      case 'weco.branch.subbranches':
        errMsg = 'Error creating new branch.';
        name = 'CREATE_BRANCH';
        successMsg = args => `Successfully created b/${args.branchid}!`;
        break;

      case 'weco.branch.wall':
        errMsg = 'Error creating post.';
        name = 'CREATE_POST';
        params.forceUpdate = false;
        successMsg = 'Successfully created post!';
        break;

      /*
      // broadcast add comment clicked so that the comment section is scrolled
      // to the top, where the comment box is visible
      case 'weco.branch.post':
        $rootScope.$broadcast('add-comment');
      */
      default:
        // Do nothing.
        break;
    }

    if (name) {
      this.ModalService.open(name, params, successMsg, errMsg);
    }
  }

  isHeaderButtonVisible() {
    const allowedStates = [
      'weco.branch.subbranches',
      'weco.branch.wall',
      'weco.branch.post',
    ];

    return this.UserService.isAuthenticated() && allowedStates.includes(this.$state.current.name);
  }
}

WallService.$inject = [
  '$state',
  'BranchService',
  'ModalService',
  'UserService',
];

export default WallService;
