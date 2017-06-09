import Injectable from 'utils/injectable';

class CoverPhotoController extends Injectable {
  constructor (...injections) {
    super(CoverPhotoController.$inject, injections);

    this.WallService.isCoverOpen = true;
  }

  hasUrls () {
  	return Boolean(this.imageUrl()) && Boolean(this.thumbUrl());
  }

  toggleCoverPicture () {
    this.WallService.isCoverOpen = !this.WallService.isCoverOpen;
  }
}

CoverPhotoController.$inject = [
	'$state',
  'BranchService',
	'ModalService',
  'WallService'
];

export default CoverPhotoController;
