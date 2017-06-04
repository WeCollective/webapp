import Injectable from 'utils/injectable';

class CoverPhotoController extends Injectable {
  constructor(...injections) {
    super(CoverPhotoController.$inject, injections);

    this.isOpen = true;
  }

  hasUrls () {
  	return Boolean(this.imageUrl()) && Boolean(this.thumbUrl());
  }
  
  hideCoverPicture () {
  	this.isOpen = false;
  }

  showCoverPicture () {
  	this.isOpen = true;
  }
}

CoverPhotoController.$inject = [
	'$state',
	'ModalService'
];

export default CoverPhotoController;