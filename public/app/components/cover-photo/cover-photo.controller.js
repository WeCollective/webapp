import Injectable from 'utils/injectable';

class CoverPhotoController extends Injectable {
  constructor(...injections) {
    super(CoverPhotoController.$inject, injections);
  }
  showCoverPicture() { this.isOpen = true; }
  hideCoverPicture() { this.isOpen = false; }
  hasUrls() { return Boolean(this.imageUrl()) && Boolean(this.thumbUrl()); }
}
CoverPhotoController.$inject = ['$state', 'ModalService'];

export default CoverPhotoController;
