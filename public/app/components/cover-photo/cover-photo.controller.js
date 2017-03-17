import Injectable from 'utils/injectable';

class CoverPhotoController extends Injectable {
  constructor(...injections) {
    super(CoverPhotoController.$inject, injections);
  }
  showCoverPicture() { this.isOpen = true; }
  hideCoverPicture() { this.isOpen = false; }
  hasUrls() { return Boolean(this.imageUrl()) && Boolean(this.thumbUrl()); }
  openCoverPictureModal() {
    // Modal.open('/app/components/modals/upload/upload-image.modal.view.html', { route: 'branch/' + $scope.branchid + '/', type: 'cover' })
    //   .then(function(result) {
    //     // reload state to force profile reload if OK was pressed
    //     if(result) {
    //       $state.go($state.current, {}, {reload: true});
    //     }
    //   }, function() {
    //     Alerts.push('error', 'Unable to update cover picture.');
    //   });
  }
}
CoverPhotoController.$inject = ['$state'];

export default CoverPhotoController;
