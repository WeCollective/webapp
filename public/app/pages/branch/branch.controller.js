import Injectable from 'utils/injectable';

class BranchController extends Injectable {
  constructor(...injections) {
    super(BranchController.$inject, injections);

    this.branch = {};
    this.parent = {};
    this.showCover = false;
    this.isLoading = false;
    this.filters = {
      time: ['ALL TIME', 'PAST YEAR', 'PAST MONTH', 'PAST WEEK', 'PAST 24 HRS', 'PAST HOUR']
    };
    //
    // fetch branch object
    // Branch.get($state.params.branchid).then(function(branch) {
    //   $timeout(function () {
    //     $scope.branch = branch;
    //   });
    //   // now fetch branch mods
    //   return Mod.getByBranch($scope.branchid);
    // }, function(response) {
    //   // TODO: handle other error codes
    //   // branch not found - 404
    //   if(response.status == 404) {
    //     $state.go('weco.notfound');
    //   }
    // }).then(function(mods) {
    //   $timeout(function () {
    //     $scope.branch.mods = mods;
    //     $scope.isLoading = false;
    //   });
    //   // now fetch branch parent
    //   return Branch.get($scope.branch.parentid);
    // }).then(function(parent) {
    //   $timeout(function() {
    //     $scope.parent = parent;
    //   });
    // }, function(response) {
    //   // No parent exists (in root)
    //   $timeout(function () {
    //     $scope.isLoading = false;
    //   });
    // });
  }

  getTimeafter(timeItem) {
    // compute the appropriate timeafter for the selected time filter
    let timeafter;
    let date = new Date();
    switch(timeItem) {
      case 'ALL TIME':
        timeafter = 0;
        break;
      case 'PAST YEAR':
        timeafter = new Date().setFullYear(new Date().getFullYear() - 1);
        break;
      case 'PAST MONTH':
        timeafter = new Date().setMonth(new Date().getMonth() - 1);
        break;
      case 'PAST WEEK':
        timeafter = new Date().setDate(new Date().getDate() - 7);
        break;
      case 'PAST 24 HRS':
        timeafter = new Date().setDate(new Date().getDate() - 1);
        break;
      case 'PAST HOUR':
        timeafter = new Date().setHours(new Date().getHours() - 1);
        break;
      default:
        timeafter = 0;
        break;
    }
    return timeafter;
  }

  isControlSelected(control) {
    return this.$state.current.name.indexOf(control) > -1;
  }

  openProfilePictureModal() {
    this.ModalService.open('/app/components/modal/upload-image/upload-image.modal.view.html', { route: 'branch/' + this.branch.id + '/', type: 'picture' })
      .then((result) => {
        // reload state to force profile reload if OK was pressed
        if(result) {
          this.$state.go(this.$state.current, {}, {reload: true});
        }
      }).catch(() => {
        this.AlertsService.push('error', 'Unable to update profile picture.');
      });
  }

  openCoverPictureModal() {
    this.ModalService.open('/app/components/modal/upload-image/upload-image.modal.view.html', { route: 'branch/' + this.branch.id + '/', type: 'cover' })
      .then((result) => {
        // reload state to force profile reload if OK was pressed
        if(result) {
          this.$state.go(this.$state.current, {}, {reload: true});
        }
      }).catch(() => {
        this.AlertsService.push('error', 'Unable to update cover picture.');
      });
  }

  isModerator() {
    if(!this.branch.mods) {
      return false;
    }
    for(let i = 0; i < this.branch.mods.length; i++) {
      if(this.branch.mods[i].username === this.UserService.user.username) {
        return true;
      }
    }
    return false;
  }
}
BranchController.$inject = ['$timeout', 'ModalService', 'UserService'];

export default BranchController;
